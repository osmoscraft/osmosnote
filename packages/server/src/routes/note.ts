import type { RouteHandlerMethod } from "fastify";
import { getCurrentId } from "../lib/id";
import { readNote, writeNote } from "../lib/note-file-io";
import { Note, parseNote } from "../lib/parse-note";
import { stringifyNote } from "../lib/stringify-note";

export interface HandleGetNote {
  Params: {
    id: string;
  };
  Reply: GetNoteReply;
}

export interface GetNoteReply {
  title: string;
  content: string;
}

export const handleGetNote: RouteHandlerMethod<any, any, any, HandleGetNote> = async (request, reply) => {
  const params = request.params;
  const id = params.id;

  const rawMarkdown = await readNote(`${id}.md`);
  const note = parseNote(rawMarkdown);

  return {
    title: note.metadata.title,
    content: note.content,
  };
};

export interface HandleCreateNote {
  Body: CreateNoteBody;
  Reply: CreateNoteReply;
}

export interface CreateNoteBody {
  note: Note;
}

export interface CreateNoteReply {
  filename: string;
  title: string;
  content: string;
}

export const handleCreateNote: RouteHandlerMethod<any, any, any, HandleCreateNote> = async (request, reply) => {
  const draftNote = request.body.note;
  const rawMarkdown = stringifyNote(draftNote);
  const id = getCurrentId();
  const filename = `${id}.md`;

  await writeNote(filename, rawMarkdown);

  return {
    filename,
    title: draftNote.metadata.title,
    content: draftNote.content,
  };
};
