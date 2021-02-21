export interface Note {
  metadata: NoteMetadata;
  raw: string;
}

export interface NoteMetadata {
  title: string;
  url?: string;
}

export function parseNote(rawText: string): Note {
  const lines = rawText.split("\n");
  const metaLineMatches = lines
    .map((line) => line.match(/^#\+(.+?): (.*)\n?/))
    .filter((match) => match !== null) as RegExpMatchArray[];

  const title = metaLineMatches.find(([raw, key, value]) => key === "title")?.[2] ?? "";

  return {
    metadata: {
      title,
    },
    raw: rawText,
  };
}
