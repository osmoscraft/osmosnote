export interface Note {
  metadata: NoteMetadata;
  raw: string;
}

export interface NoteMetadata {
  title: string;
  url?: string;
  tags: string[];
}

export function parseNote(rawText: string): Note {
  const lines = rawText.split("\n");
  const metaLineMatches = lines
    .map((line) => line.match(/^#\+(.+?): (.*)\n?/))
    .filter((match) => match !== null) as RegExpMatchArray[];

  const title = metaLineMatches.find(([raw, key, value]) => key === "title")?.[2] ?? ""; // extract "value"
  const tagsLine = metaLineMatches.find(([raw, key, value]) => key === "tags")?.[0]; // extract "raw"
  const tags = tagsLine ? parseTagsLine(tagsLine) : [];

  return {
    metadata: {
      title,
      tags,
    },
    raw: rawText,
  };
}

export function parseTagsLine(line: string): string[] {
  return line.slice("#+tags: ".length).split(", ");
}
