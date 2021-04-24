import { getAppConfig } from "../lib/app-config";
import { createHandler } from "../lib/create-handler";
import { getTimestampId } from "../lib/get-timestamp-id";
import { gitAdd } from "../lib/git";
import { idToFilename } from "../lib/id-to-filename";
import { writeNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";

export interface CreateNoteInput {
  note: string;
}

export interface CreateNoteOutput {
  id: string;
  title: string;
  note: string;
}

export const handleCreateNote = createHandler<CreateNoteOutput, CreateNoteInput>(async (input) => {
  const note = input.note;
  const id = getTimestampId();
  const filename = idToFilename(id);
  const config = await getAppConfig();

  const { metadata } = parseNote(note);

  await writeNote(filename, note);
  await gitAdd(config.repoDir);

  return {
    id,
    note,
    title: metadata.title,
  };
});
