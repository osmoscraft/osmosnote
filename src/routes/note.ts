import type { RouteHandlerMethod } from "fastify";
import { getNoteByFilename } from "../lib/get-note";
import { parseNote } from "../lib/parse-note";

export interface NoteRouteHandler {
  Params: {
    id: string;
  };
  Reply: {
    title: string;
    content: string;
  };
}

export const handleNoteRoute: RouteHandlerMethod<any, any, any, NoteRouteHandler> = async (request, reply) => {
  const params = request.params;
  const id = params.id;

  const rawMarkdown = await getNoteByFilename(`${id}.md`);
  const note = parseNote(rawMarkdown);

  return {
    title: note.metadata.title,
    content: note.content,
  };
};
