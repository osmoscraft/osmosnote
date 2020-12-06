import type { RouteHandlerMethod } from "fastify";
import { getConfig } from "../config";
import fs from "fs-extra";
import path from "path";
import { parseNote } from "../lib/parse-note";

export interface NotesRouteHandler {
  Params: {
    id: string;
  };
  Reply: {
    title: string;
    content: string;
  };
}

export const handleNotesRoute: RouteHandlerMethod<any, any, any, NotesRouteHandler> = async (request, reply) => {
  const config = await getConfig();

  const params = request.params;
  const id = params.id;
  const notesDir = config.notesDir;

  const rawMarkdown = await fs.readFile(path.join(notesDir, `${id}.md`), "utf-8");
  const note = parseNote(rawMarkdown);

  return {
    title: note.metadata.title,
    content: note.content,
  };
};
