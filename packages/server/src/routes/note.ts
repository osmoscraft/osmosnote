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
  note: Note;
}

export const handleGetNote: RouteHandlerMethod<any, any, any, HandleGetNote> = async (request, reply) => {
  const params = request.params;
  const id = params.id;

  const rawMarkdown = await readNote(`${id}.md`);
  const note = parseNote(rawMarkdown);

  return {
    note,
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
  note: Note;
}

export const handleCreateNote: RouteHandlerMethod<any, any, any, HandleCreateNote> = async (request, reply) => {
  const draftNote = request.body.note;
  const rawMarkdown = stringifyNote(draftNote);
  const id = getCurrentId();
  const filename = `${id}.md`;

  await writeNote(filename, rawMarkdown);
  const note = parseNote(rawMarkdown); // re-parse it on server side to be guard against client-side errors

  return {
    filename,
    note,
  };
};

export interface HandleUpdateNote {
  Params: {
    id: string;
  };
  Body: UpdateNoteBody;
  Reply: UpdateNoteReply;
}

export interface UpdateNoteBody {
  note: Note;
}

export interface UpdateNoteReply {
  filename: string;
  note: Note;
}

export const handleUpdateNote: RouteHandlerMethod<any, any, any, HandleUpdateNote> = async (request, reply) => {
  const params = request.params;
  const id = params.id;
  const filename = `${id}.md`;
  const draftNote = request.body.note;
  const rawMarkdown = stringifyNote(draftNote);

  await writeNote(filename, rawMarkdown);
  const note = parseNote(rawMarkdown);

  return {
    filename,
    note,
  };
};
