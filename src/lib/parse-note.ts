import grayMatter from "gray-matter";

export interface Note {
  metadata: NoteMetadata;
  content: string;
}

export interface NoteMetadata {
  title: string;
}

export function parseNote(rawMarkdown: string): Note {
  const parseResult = grayMatter(rawMarkdown);
  const title = parseResult.data.title;
  const content = parseResult.content;

  return {
    metadata: {
      title,
    },
    content,
  };
}
