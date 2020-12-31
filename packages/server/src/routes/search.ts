import type { RouteHandlerMethod } from "fastify";
import { performance } from "perf_hooks";
import { getConfig } from "../config";
import { readNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";
import { runShell } from "../lib/run-shell";

const RESULT_LIMIT = 10;

export interface SearchRouteHandler {
  Querystring: {
    phrase: string;
  };
  Reply: SearchResult;
}

export interface SearchResult {
  items: SearchResultItem[];
  durationInMs: number;
}

export interface SearchResultItem {
  filename: string;
  title: string;
  score: number;
}

export const handleSearch: RouteHandlerMethod<any, any, any, SearchRouteHandler> = async (request, reply) => {
  const config = await getConfig();

  const query = request.query;
  const phrase = query.phrase;
  const notesDir = config.notesDir;

  const now = performance.now();
  const items = await searchRipgrep(phrase, notesDir);
  const durationInMs = performance.now() - now;

  return {
    items,
    durationInMs,
  };
};

async function searchRipgrep(phrase: string, dir: string): Promise<SearchResultItem[]> {
  const wordsInput = phrase.trim().split(" ").join("\\W+(?:\\w+\\W+){0,3}?"); // two words separated by 0 to 3 other words

  // TODO when tags are present, do two separate searches
  // the first one gives a list of files with ALL tags in it.
  // the second one is the ordinary keyword full text search
  // return intersection of the two searches

  /**
   * \\b ensures word boundary
   *
   * trim result with `| head` to prevent node buffer overflow
   */
  const {
    error,
    stdout,
    stderr,
  } = await runShell(`rg "\\b${wordsInput}" --ignore-case --count-matches | head -n ${RESULT_LIMIT}`, { cwd: dir });

  if (error) {
    if (error.code === 1) {
      return [];
    } else {
      throw stderr;
    }
  } else if (!stdout.length) {
    return [];
  } else {
    const lines = stdout.trim().split("\n");
    const searchResultItems = lines
      .map((line) => line.split(":") as [filename: string, count: string])
      .map((line) => ({ filename: line[0], score: parseInt(line[1]) }));

    // open each note to parse its title
    const notesAsync = searchResultItems.map(async (item) => {
      const markdown = await readNote(item.filename);
      const parseResult = parseNote(markdown);

      return {
        filename: item.filename,
        title: parseResult.metadata.title,
        content: parseResult.content,
        score: item.score,
      };
    });

    const notes: SearchResultItem[] = await Promise.all(notesAsync);
    const sortedNotes = notes
      .sort((a, b) => a.title.localeCompare(b.title)) // sort title first to result can remain the same
      .sort((a, b) => b.score - a.score);

    return sortedNotes;
  }
}
