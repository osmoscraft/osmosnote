import { performance } from "perf_hooks";
import { createHandler } from "../lib/create-handler";
import { filenameToId } from "../lib/filename-to-id";
import { getSearchRankScore } from "../lib/get-search-rank-score";
import { readNote } from "../lib/note-file-io";
import { parseNote } from "../lib/parse-note";
import { getRepoMetadata } from "../lib/repo-metadata";
import { runShell } from "../lib/run-shell";
import { TAG_SEPARATOR } from "../lib/tag";
import { unique } from "../lib/unique";

const DEFAULT_RESULT_LIMIT = 30;

export interface SearchNoteInput {
  phrase: string;
  tags?: string[];
  limit?: number;
}

export interface SearchNoteOutput {
  items: SearchResultItem[];
  durationInMs: number;
}

export interface SearchResultItem {
  id: string;
  title: string;
  tags: string[];
  score: number;
}

export const handleSearchNote = createHandler<SearchNoteOutput, SearchNoteInput>(async (input) => {
  const config = await getRepoMetadata();

  const phrase = input.phrase;
  const tags = input.tags ?? [];
  const limit = input.limit ?? DEFAULT_RESULT_LIMIT;
  const notesDir = config.repoDir;

  const now = performance.now();
  const items = await searchRipgrep(phrase, tags, notesDir, limit);
  const durationInMs = performance.now() - now;

  return {
    items,
    durationInMs,
  };
});

async function searchRipgrep(phrase: string, tags: string[], dir: string, limit: number): Promise<SearchResultItem[]> {
  const _ = TAG_SEPARATOR;
  const keywordQuery = phrase.trim();
  let getFilenamesPreprocess: string = "";

  /*
   * When tags are specified, we require all result files to contain all of tags.
   * All tags must be used on a single line, prefixed with "#+tags: ".
   * Adjacent tags must be separated by ", "
   * This will speed up regex as it prevents lookahead/lookback
   */
  if (tags.length) {
    /*
     * Get a list of files contains all the tags, separated by space.
     * Each tag will cause a full search pass. Optimization TBD
     * -l list file names only
     * -0 removes new line character after each file name
     *  ./ forces rg to stop waiting for more input from stdin (https://github.com/BurntSushi/ripgrep/issues/2056)
     * xargs -0 formats the file names into a space separate list that can be piped into the next rg command. -r stops processing if it's empty
     */
    getFilenamesPreprocess = tags
      .map((tag) => String.raw`rg "#\+tags(: |.+, )${tag}.*(,|\$)" -l --ignore-case -0 ./ | xargs -0 -r `)
      .join("");
  }

  const keywords = keywordQuery.split(" ").filter((keyword) => !!keyword);

  if (keywords.length) {
    return keywordSearch(dir, keywords, getFilenamesPreprocess, limit);
  } else if (tags) {
    return tagOnlySearch(dir, getFilenamesPreprocess, limit);
  } else {
    return [];
  }
}

async function tagOnlySearch(dir: string, getFilenamesPreprocess: string, limit: number) {
  const { error, stdout, stderr } = await runShell(`${getFilenamesPreprocess}`, { cwd: dir });

  if (error) {
    if (error.code === 1 || stderr?.trim().length) {
      console.log(`[search] ${stderr}`);
      return [];
    } else {
      throw stderr;
    }
  } else if (!stdout.length) {
    return [];
  } else {
    const filenames = stdout.trim().split(" ");

    const notesAsync = unique(filenames).map(async (filename) => {
      const markdown = await readNote(filename);
      const parseResult = parseNote(markdown);

      return {
        id: filenameToId(filename),
        title: parseResult.metadata.title,
        tags: parseResult.metadata.tags,
        score: 0, // can't tally tag score yet
      };
    });

    const notes: SearchResultItem[] = await Promise.all(notesAsync);
    const sortedNotes = notes
      .sort((a, b) => a.title.localeCompare(b.title)) // sort title first to result can remain the same
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sortedNotes;
  }
}

async function keywordSearch(dir: string, keywords: string[], getFilenamesPreprocess: string, limit: number) {
  const wordsInput = keywords.join(String.raw`\W+(?:\w+\W+){0,5}?`); // two words separated by 0 to 5 other words
  const fullPhrase = keywords.join(" ");

  let searchCommand = "";
  if (keywords.length) {
    if (getFilenamesPreprocess) {
      // -H ensures file path is displayed even when there is only one result
      searchCommand = String.raw`${getFilenamesPreprocess}rg "\b${wordsInput}" -H --ignore-case --count-matches | head -n ${limit}`;
    } else {
      searchCommand = String.raw`rg "\b${wordsInput}" -H --ignore-case --count-matches ./ | head -n ${limit}`;
    }
  }

  /**
   * \\b ensures word boundary
   *
   * trim result with `| head` to prevent node buffer overflow
   */
  const { error, stdout, stderr } = await runShell(searchCommand, { cwd: dir });

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
      .map((line) => ({ filename: line[0], frequencyScore: parseInt(line[1]) }));

    // open each note to parse its title
    const notesAsync = searchResultItems.map(async (item) => {
      const markdown = await readNote(item.filename);
      const parseResult = parseNote(markdown);
      const score = item.frequencyScore + 100 * getSearchRankScore(fullPhrase, parseResult.metadata.title); // title should be very heavy

      return {
        id: filenameToId(item.filename),
        title: parseResult.metadata.title,
        tags: parseResult.metadata.tags,
        score,
      };
    });

    const notes: SearchResultItem[] = await Promise.all(notesAsync);
    const sortedNotes = notes
      .sort((a, b) => a.title.localeCompare(b.title)) // sort title first to result can remain the same
      .sort((a, b) => b.score - a.score);

    return sortedNotes;
  }
}
