import { createHandler } from "../lib/create-handler";
import { writeNote } from "../lib/note-file-io";

export interface UpdateNoteInput {
  id: string;
  note: string;
}

export interface UpdateNoteOutput {
  note: string;
}

export const handleUpdateNote = createHandler<UpdateNoteOutput, UpdateNoteInput>(async (input) => {
  const id = input.id;
  const filename = `${id}.md`;
  const note = input.note;

  await writeNote(filename, note);

  return {
    note,
  };
});
