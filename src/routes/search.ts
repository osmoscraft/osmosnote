import { exec } from "child_process";
import type { RouteHandlerMethod } from "fastify";
import { performance } from "perf_hooks";
import { getConfig } from "../config";

export interface SearchRouteHandler {
  Querystring: {
    phrase: string;
  };
  Reply: {
    items: SearchResultItem[];
    durationInMs: number;
  };
}

export interface SearchResultItem {
  filename: string;
  score: number;
}

export const handleSearchRoute: RouteHandlerMethod<any, any, any, SearchRouteHandler> = async (request, reply) => {
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

function searchRipgrep(phrase: string, dir: string): Promise<SearchResultItem[]> {
  const wordsInput = phrase.trim().split(" ").join("\\W+(?:\\w+\\W+){0,3}?"); // two words separated by 0 to 3 other words

  return new Promise((resolve, reject) => {
    /**
     * \\b ensures word boundary
     *
     * trim result with `| head` to prevent node buffer overflow
     */
    exec(
      `rg "\\b${wordsInput}" --ignore-case --count-matches | head -n 100`,
      {
        cwd: dir,
      },
      (error, stdout, stderr) => {
        if (error) {
          if (error.code === 1) {
            resolve([]);
          } else {
            reject(stderr);
          }
        } else if (!stdout.length) {
          resolve([]);
        } else {
          const lines = stdout.trim().split("\n");
          const searchResultItems = lines
            .map((line) => line.split(":") as [filename: string, count: string])
            .map((line) => ({ filename: line[0], score: parseInt(line[1]) }))
            .sort((a, b) => b.score - a.score);

          resolve(searchResultItems);
        }
      }
    );
  });
}

/**
 * @deprecated
 */
function search(phrase: string, dir: string): Promise<SearchResultItem[]> {
  const wordsInput = phrase
    .trim()
    .split(" ")
    .map((word) => `-e ${word}`)
    .join(" ");

  return new Promise((resolve, reject) => {
    /**
     * DONE replace with ripgrep for highlight and better performance
     *
     * --all-match make sure all keywords appear in the file
     * -o forces each word to be displayed on a new line
     * -n shows line number. We can use it later to show match context
     * -w prevents partial word
     *
     * trim result with `| head` to prevent node buffer overflow
     */
    exec(
      `git grep ${wordsInput} --ignore-case --all-match -o -n -w | head -n 1000`,
      {
        cwd: dir,
      },
      (error, stdout, stderr) => {
        if (error) {
          if (error.code === 1) {
            resolve([]);
          } else {
            reject(stderr);
          }
        } else if (!stdout.length) {
          resolve([]);
        } else {
          const lines = stdout.trim().split("\n");
          const searchResultItems = lines
            .map((line) => line.split(":") as [filename: string, lineNumber: string, word: string])
            .reduce((result, currentLine) => {
              const filename = currentLine[0];
              result[filename] = result[filename] ? result[filename] + 1 : 1;
              return result;
            }, {} as Record<string, number>);

          const randkedResult = Object.entries(searchResultItems)
            .map(([filename, count]) => ({
              filename,
              score: count,
            }))
            .sort((a, b) => b.score - a.score);

          resolve(randkedResult);
        }
      }
    );
  });
}
