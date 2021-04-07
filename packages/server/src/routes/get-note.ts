import { createHandler } from "../lib/create-handler";
import { idToFilename } from "../lib/id-to-filename";
import { readNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";

export interface GetNoteInput {
  id: string;
}

export interface GetNoteOutput {
  title: string;
  note: string;
}

export const handleGetNote = createHandler<GetNoteOutput, GetNoteInput>(async (input) => {
  const id = input.id;
  const filename = idToFilename(id);
  const note = await readNote(filename);
  const parseResult = parseNote(note);

  return {
    title: parseResult.metadata.title,
    note,
  };
});
