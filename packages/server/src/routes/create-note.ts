import { createHandler } from "../lib/create-handler";
import { getCurrentId } from "../lib/get-current-id";
import { writeNote } from "../lib/note-file-io";

export interface CreateNoteInput {
  note: string;
}

export interface CreateNoteOutput {
  id: string;
  note: string;
}

export const handleCreateNote = createHandler<CreateNoteOutput, CreateNoteInput>(async (input) => {
  const note = input.note;
  const id = getCurrentId();
  const filename = `${id}.md`;

  await writeNote(filename, note);

  return {
    id,
    note,
  };
});
