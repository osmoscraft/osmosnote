export interface ParsedQuery {
  phrase: string;
  tags: string[];
}
export function parseQuery(query: string): ParsedQuery {
  const raw = " " + query.trim(); // Front-pad with a space to make arg parsing easier
  let phraseResult = "";
  let tagsResult: string[] = [];

  // naive parsing for now, since we only one args type
  const tagsStartIndex = raw.indexOf(" -t ");

  if (tagsStartIndex < 0) {
    phraseResult = raw.trim();
    tagsResult = [];
  } else {
    phraseResult = raw.slice(0, tagsStartIndex);
    const tagsRaw = raw.slice(tagsStartIndex + " -t ".length);
    tagsResult = tagsRaw
      .split(",")
      .map((tagRaw) => tagRaw.trim())
      .filter((tagTrimmed) => tagTrimmed.length > 0);
  }

  return {
    phrase: phraseResult,
    tags: tagsResult,
  };
}
