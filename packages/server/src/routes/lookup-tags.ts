import { getConfig } from "../config";
import { createHandler } from "../lib/create-handler";
import { runShell } from "../lib/run-shell";
import { TAG_SEPARATOR } from "../lib/tag";

export interface LookupTagsInput {
  phrase: string;
}

export interface LookupTagsOutput {
  tags: string[];
}

export const handleLookupTags = createHandler<LookupTagsOutput, LookupTagsInput>(async (input) => {
  const phrase = input.phrase.trim();

  const config = await getConfig();
  const dir = config.notesDir;

  if (!phrase) {
    return {
      tags: [],
    };
  }

  const _ = TAG_SEPARATOR;

  // Consider performance optimization: performance full text search and filter to results on the line that starts with "#+tags:"

  /**
   * -I hides filename
   * -N hides line number
   * -o only include matched tags
   * --no-heading removes blank line between files
   */
  const findAllMatchingTagLinesCommand = String.raw`rg "^#\+tags:.*?\b${phrase}" --no-heading --ignore-case -INo`;
  const { error, stdout, stderr } = await runShell(findAllMatchingTagLinesCommand, { cwd: dir });

  if (error) {
    if (error.code === 1) {
      return {
        tags: [],
      };
    } else {
      console.log(stderr);
      throw stderr;
    }
  } else if (!stdout.length) {
    return {
      tags: [],
    };
  } else {
    const allMatchedLines = stdout.trim().split("\n");
    const tagRegex = new RegExp(String.raw`\b${phrase}`);
    const allMatchedTags = allMatchedLines.flatMap(parseTagsLine).filter((tag) => tag.match(tagRegex));

    const sortedTags = [...new Set(allMatchedTags.sort())];

    return {
      tags: sortedTags,
    };
  }
});

// TODO consolidate with parse-note
export function parseTagsLine(line: string): string[] {
  return line.slice("#+tags ".length).split(" ,");
}
