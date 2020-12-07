import type { RouteHandlerMethod } from "fastify";
import { getConfig } from "../config";
import { readNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";
import { runShell } from "../lib/run-shell";

const LIMIT = 10;

export interface NoteListRouteHandler {
  Reply: NoteListReply;
}

export interface NoteListReply {
  notes: NoteListItem[];
}

export interface NoteListItem {
  filename: string;
  title: string;
  content: string;
}

export const handleNoteListRoute: RouteHandlerMethod<any, any, any, NoteListRouteHandler> = async (request, reply) => {
  const config = await getConfig();

  const notesDir = config.notesDir;

  const { stdout, stderr, error } = await runShell(`ls -1t *.md | head -n ${LIMIT}`, { cwd: notesDir });

  if (error) {
    throw error;
  }

  if (stderr.length) {
    throw stderr;
  }

  const filenames = stdout.trim().split("\n");

  const notesAsync = filenames.map(async (filename) => {
    const markdown = await readNote(filename);
    const parseResult = parseNote(markdown);

    return {
      filename: filename,
      title: parseResult.metadata.title,
      content: parseResult.content,
    };
  });

  const notes: NoteListItem[] = await Promise.all(notesAsync);

  return {
    notes,
  };
};
