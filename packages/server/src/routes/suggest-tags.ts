import type { RouteHandlerMethod } from "fastify";
import { getConfig } from "../config";
import { runShell } from "../lib/run-shell";

const RECENT_NOTE_LIMIT = 30;

export interface HandleSuggestTags {
  Body: SuggestTagsBody;
  Reply: SuggestTagsReply;
}

export interface SuggestTagsBody {}

export interface SuggestedTag {
  text: string;
  score: number;
}

export interface SuggestTagsReply {
  error?: string;
  data?: {
    tags: SuggestedTag[];
  };
}

/**
 * v1 - return top used tags from recently modified files
 */
export const handleSuggestTags: RouteHandlerMethod<any, any, any, HandleSuggestTags> = async (request, reply) => {
  const config = await getConfig();

  const notesDir = config.notesDir;

  const { stdout, stderr, error } = await runShell(
    `ls -1t *.md | head -n ${RECENT_NOTE_LIMIT} | xargs -d "\\n" rg ":[^:\\s]+?(\\s+[^:\\s]+?)*:" -INo --no-heading`,
    {
      cwd: notesDir,
    }
  );

  if (error) {
    if (error.code === 1) {
      return {
        data: {
          tags: [],
        },
      };
    } else {
      console.log(stderr);
      return {
        error: stderr,
      };
    }
  } else if (!stdout.length) {
    return {
      data: {
        tags: [],
      },
    };
  } else {
    const allTags = stdout.trim().split("\n");

    const trimmedTags = allTags.map((tag) => tag.slice(1, -1)); // remove the ":"
    const tagsByFrequency = new Map<string, number>();
    trimmedTags.forEach((tag) => {
      const currentCount = tagsByFrequency.get(tag);
      tagsByFrequency.set(tag, currentCount ? currentCount + 1 : 1);
    });

    const sortedTags: SuggestedTag[] = [...tagsByFrequency.entries()]
      .map(([tag, count]) => ({ text: tag, score: count }))
      .sort((a, b) => b.score - a.score);

    return {
      data: {
        tags: sortedTags,
      },
    };
  }
};
