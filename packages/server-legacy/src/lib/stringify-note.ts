import type { Note } from "./parse-note";
import grayMatter from "gray-matter";

export function stringifyNote(note: Note): string {
  const rawMarkdown = grayMatter.stringify(note.content, {
    title: note.metadata.title,
    ...(note.metadata.url ? { url: note.metadata.url } : {}),
  });

  return rawMarkdown;
}
