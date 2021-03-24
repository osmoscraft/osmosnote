import { createHandler } from "../lib/create-handler";
import { idToFilename } from "../lib/id-to-filename";
import { readNote } from "../lib/note-file-io";

export interface GetNoteInput {
  id: string;
}

export interface GetNoteOutput {
  note: string;
}

export const handleGetNote = createHandler<GetNoteOutput, GetNoteInput>(async (input) => {
  const id = input.id;
  const filename = idToFilename(id);
  const note = await readNote(filename);

  return {
    note,
  };
});
