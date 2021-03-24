import { createHandler } from "../lib/create-handler";
import { idToFilename } from "../lib/id-to-filename";
import { deleteNote } from "../lib/note-file-io";

export interface DeleteNoteInput {
  id: string;
}

export interface DeleteNoteOutput {}

export const handleDeleteNote = createHandler<DeleteNoteOutput, DeleteNoteInput>(async (input) => {
  const id = input.id;
  const filename = idToFilename(id);
  await deleteNote(filename);

  return {};
});
