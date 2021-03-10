import { getConfig } from "../config";
import { createHandler } from "../lib/create-handler";
import { filenameToId } from "../lib/filename-to-id";
import { readNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";
import { runShell } from "../lib/run-shell";

const DEFAULT_LIMIT = 10;

export interface GetRecentNotesOutput {
  notes: RecentNoteItem[];
}

export interface GetRecentNotesInput {
  limit?: number;
}

export interface RecentNoteItem {
  id: string;
  title: string;
  tags: string[];
  raw: string;
}

export const handleGetRecentNotes = createHandler<GetRecentNotesOutput, GetRecentNotesInput>(async (input) => {
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
      id: filenameToId(filename),
      title: parseResult.metadata.title,
      tags: parseResult.metadata.tags,
      raw: parseResult.raw,
    };
  });

  const notes: RecentNoteItem[] = await Promise.all(notesAsync);

  return {
    notes,
  };
});
