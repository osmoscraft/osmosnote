import { createHandler } from "../lib/create-handler";
import { getCurrentId } from "../lib/get-current-id";
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
  const id = getCurrentId();
  const filename = `${id}.md`;

  const { metadata } = parseNote(note);

  await writeNote(filename, note);

  return {
    id,
    note,
    title: metadata.title,
  };
});
