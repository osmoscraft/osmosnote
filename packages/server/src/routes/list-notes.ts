import type { RouteHandlerMethod } from "fastify";
import { getConfig } from "../config";
import { createHandler } from "../lib/create-handler";
import { readNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";
import { runShell } from "../lib/run-shell";

const DEFAULT_LIMIT = 10;

export interface ListNotesOutput {
  notes: NoteListItem[];
}

export interface ListNotesInput {
  limit?: number;
}

export interface NoteListItem {
  filename: string;
  title: string;
  raw: string;
}

export const handleListNotes = createHandler<ListNotesOutput, ListNotesInput>(async (input) => {
  const config = await getConfig();

  const notesDir = config.notesDir;
  const { limit = DEFAULT_LIMIT } = input;

  const { stdout, stderr, error } = await runShell(`ls -1t *.md | head -n ${limit}`, { cwd: notesDir });

  if (error || stderr.length) {
    if (stderr) console.log("[note-list] cannot list", stderr);
    if (error) console.log("[note-list] cannot list", error.name);

    return {
      notes: [],
    };
  }

  const filenames = stdout.trim().split("\n");

  const notesAsync = filenames.map(async (filename) => {
    const markdown = await readNote(filename);
    const parseResult = parseNote(markdown);

    return {
      filename: filename,
      title: parseResult.metadata.title,
      raw: parseResult.raw,
    };
  });

  const notes: NoteListItem[] = await Promise.all(notesAsync);

  return {
    notes,
  };
});
