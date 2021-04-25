import { getRepoMetadata } from "../lib/repo-metadata";
import { createHandler } from "../lib/create-handler";
import { gitAdd } from "../lib/git";
import { idToFilename } from "../lib/id-to-filename";
import { writeNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";

export interface UpdateNoteInput {
  id: string;
  note: string;
}

export interface UpdateNoteOutput {
  note: string;
  title: string;
}

export const handleUpdateNote = createHandler<UpdateNoteOutput, UpdateNoteInput>(async (input) => {
  const id = input.id;
  const filename = idToFilename(id);
  const note = input.note;
  const config = await getRepoMetadata();

  const parseResult = parseNote(note);

  await writeNote(filename, note);
  await gitAdd(config.repoDir);

  return {
    note,
    title: parseResult.metadata.title,
  };
});
