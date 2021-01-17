import { createHandler } from "../lib/create-handler";
import { readNote } from "../lib/note-file-io";

export interface GetNoteInput {
  id: string;
}

export interface GetNoteOutput {
  note: string;
}

export const handleGetNote = createHandler<GetNoteOutput, GetNoteInput>(async (input) => {
  const id = input.id;
  const note = await readNote(`${id}.md`);

  return {
    note,
  };
});
