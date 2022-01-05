import { getRepoMetadata } from "../lib/repo-metadata";
import { createHandler } from "../lib/create-handler";
import { parseTagsLine } from "../lib/parse-note";
import { runShell } from "../lib/run-shell";
import { TAG_SEPARATOR } from "../lib/tag";
import { STORAGE_FILE_EXTENSION } from "../lib/id-to-filename";

export interface GetRecentTagsInput {
  limit?: number;
}

export interface GetRecentTagsOutput {
  tags: string[];
}

export interface SuggestedTag {
  text: string;
  score: number;
}

const RECENT_TAG_LIMIT = 10;

export const handleGetRecentTags = createHandler<GetRecentTagsOutput, GetRecentTagsInput>(async (input) => {
  const config = await getRepoMetadata();

  const notesDir = config.repoDir;

  const limit = input.limit ?? RECENT_TAG_LIMIT;

  const _ = TAG_SEPARATOR;

  /**
   * List last modified and extract tags from them.
   * The extraction logic is similar to tag look up except it doesn't use any user input
   * -I hides filename
   * -N hides line number
   * --no-heading removes blank line between files
   */
  const { stdout, stderr, error } = await runShell(
    String.raw`ls -1t *${STORAGE_FILE_EXTENSION} | head -n ${limit} | xargs -d "\n" rg "^#\+tags: " --no-heading --ignore-case -IN ./`,
    {
      cwd: notesDir,
    }
  );

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
    const allTags = allMatchedLines.flatMap(parseTagsLine);

    const tagsByFrequency = new Map<string, number>();
    allTags.forEach((tag) => {
      const currentCount = tagsByFrequency.get(tag);
      tagsByFrequency.set(tag, currentCount ? currentCount + 1 : 1);
    });

    const sortedTags: SuggestedTag[] = [...tagsByFrequency.entries()]
      .map(([tag, count]) => ({ text: tag, score: count }))
      .sort((a, b) => b.score - a.score);

    const plainTextTags = sortedTags.map((tag) => tag.text);

    return {
      tags: plainTextTags,
    };
  }
});
