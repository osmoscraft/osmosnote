import type { RouteHandlerMethod } from "fastify";
import { getConfig } from "../config";
import { runShell } from "../lib/run-shell";
import { TAG_SEPARATOR } from "../lib/tag";

export interface HandleLookupTags {
  Body: LookupTagsBody;
  Reply: LookupTagsReply;
}

export interface LookupTagsBody {
  query: string;
}

export type LookupTagsReply = {
  error?: string;
  data?: {
    tags: string[];
  };
};

export const handleLookupTags: RouteHandlerMethod<any, any, any, HandleLookupTags> = async (request, reply) => {
  const query = request.body.query?.trim();

  const config = await getConfig();
  const dir = config.notesDir;

  if (!query) {
    return {
      data: {
        tags: [],
      },
    };
  }

  const _ = TAG_SEPARATOR;

  /**
   * -I hides filename
   * -N hides line number
   * -o only include matched tags
   * --no-heading removes blank line between files
   */
  const findAllTagsCommand = `rg "${_}${query}[^${_}\\s]*?(\\s+[^${_}\\s]+?)*${_}" -INo --ignore-case --no-heading`;
  const { error, stdout, stderr } = await runShell(findAllTagsCommand, { cwd: dir });

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

    const sortedTags = [...new Set(allTags.sort())];
    const trimmedTags = sortedTags.map((tag) => tag.slice(1, -1)); // remove the ":"

    return {
      data: {
        tags: trimmedTags,
      },
    };
  }
};
