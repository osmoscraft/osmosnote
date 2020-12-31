import grayMatter from "gray-matter";

export interface Note {
  metadata: NoteMetadata;
  content: string;
}

export interface NoteMetadata {
  title: string;
  url?: string;
}

export function parseNote(rawMarkdown: string): Note {
  const parseResult = grayMatter(rawMarkdown);
  const { title, url } = parseResult.data;
  const content = parseResult.content;

  return {
    metadata: {
      title,
      url,
    },
    content,
  };
}
