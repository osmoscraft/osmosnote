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
  const baseQuery = phrase.trim();
  const tagsQuery = baseQuery.match(/:.+:/)?.[0];
  const keywordQuery = tagsQuery ? baseQuery.replace(tagsQuery, "") : baseQuery;

  let getFilenamesPreprocess: string = "";

  /*
   * When tags are specified, we require all result files to contain all of tags.
   */
  if (tagsQuery) {
    /*
     * ripgrep does not support look ahead, or we could use the following to emulate "AND" logic
     * ref: https://stackoverflow.com/questions/13911053/regular-expression-to-match-all-words-in-a-query-in-any-order
     * `${tags.map((tag) => `(?=.*:${tag}:)`).join("")}.+`;
     *
     * Instead, we do a pass for each tag to narrow down the filenames
     */

    /*
     * get a list of files contains all the tags, separated by space
     * -l list file names only
     * -0 removes new line character after each file name
     * xargs -0 formats the file names into a space separate list that can be piped into the next rg command. -r stops processing if it's empty
     */
    const tags = tagsQuery
      .split(":")
      .map((tag) => tag.trim())
      .filter((tag) => !!tag);
    getFilenamesPreprocess = tags.map((tag) => `rg :${tag}: -l --ignore-case -0 | xargs -0 -r `).join("");
  }

  const keywords = keywordQuery
    .trim()
    .split(" ")
    .filter((keyword) => !!keyword);

  if (keywords.length) {
    return keywordSearch(dir, keywords, getFilenamesPreprocess);
  } else if (tagsQuery) {
    return tagOnlySearch(dir, getFilenamesPreprocess);
  } else {
    return [];
  }
}

async function tagOnlySearch(dir: string, getFilenamesPreprocess: string) {
  const { error, stdout, stderr } = await runShell(`${getFilenamesPreprocess}`, { cwd: dir });

  if (error) {
    if (error.code === 1) {
      return [];
    } else {
      throw stderr;
    }
  } else if (!stdout.length) {
    return [];
  } else {
    const filenames = stdout.trim().split(" ");

    const notesAsync = filenames.map(async (filename) => {
      const markdown = await readNote(filename);
      const parseResult = parseNote(markdown);

      return {
        filename: filename,
        title: parseResult.metadata.title,
        content: parseResult.content,
        score: 0, // can't tally tag core yet
      };
    });

    const notes: SearchResultItem[] = await Promise.all(notesAsync);
    const sortedNotes = notes
      .sort((a, b) => a.title.localeCompare(b.title)) // sort title first to result can remain the same
      .sort((a, b) => b.score - a.score);

    return sortedNotes;
  }
}

async function keywordSearch(dir: string, keywords: string[], getFilenamesPreprocess: string) {
  const wordsInput = keywords.join("\\W+(?:\\w+\\W+){0,3}?"); // two words separated by 0 to 3 other words

  let searchCommand = "";
  if (keywords.length) {
    searchCommand = `${getFilenamesPreprocess}rg "\\b${wordsInput}" --ignore-case --count-matches | head -n ${RESULT_LIMIT}`;
  }

  /**
   * \\b ensures word boundary
   *
   * trim result with `| head` to prevent node buffer overflow
   */
  const {
    error,
    stdout,
    stderr,
  } = await runShell(
    `${getFilenamesPreprocess}rg "\\b${wordsInput}" --ignore-case --count-matches | head -n ${RESULT_LIMIT}`,
    { cwd: dir }
  );

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
