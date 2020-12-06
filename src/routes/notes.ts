import type { RouteHandlerMethod } from "fastify";
import { getConfig } from "../config";
import fs from "fs-extra";
import path from "path";

export interface NotesRouteHandler {
  Params: {
    id: string;
  };
  Reply: {
    title: string;
    body: string;
  };
}

export const handleNotesRoute: RouteHandlerMethod<any, any, any, NotesRouteHandler> = async (request, reply) => {
  const config = await getConfig();

  const params = request.params;
  const id = params.id;
  const notesDir = config.notesDir;

  const noteFileContent = await fs.readFile(path.join(notesDir, `${id}.md`), "utf-8");

  return {
    title: "test title",
    body: noteFileContent,
  };
};
