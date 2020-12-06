import { exec } from "child_process";
import type { RouteHandlerMethod } from "fastify";
import { getConfig } from "../config";

export interface SearchRouteHandler {
  Querystring: {
    phrase: string;
  };
  Reply: {
    items: SearchResultItem[];
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

  const items = await search(phrase, notesDir);

  return {
    items,
  };
};

function search(phrase: string, dir: string): Promise<SearchResultItem[]> {
  const wordsInput = phrase
    .trim()
    .split(" ")
    .map((word) => `-e ${word}`)
    .join(" ");

  return new Promise((resolve, reject) => {
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
