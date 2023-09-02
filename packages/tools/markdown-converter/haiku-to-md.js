import fs from "fs/promises";
import assert from "node:assert";
import path from "path";
import { fileToLines, handleBodyLines, handleHeaderLines } from "./lib.js";
const __dirname = path.resolve();
const inputDir = path.resolve(__dirname, "./input");

// console.warn = () => {};

const filenameMap = new Map();

async function main(inputDir) {
  try {
    // clear output
    await fs.rm(path.resolve(__dirname, "./output"), { force: true, recursive: true });
  } catch {}

  fs.mkdir(path.resolve(__dirname, "./output"), { recursive: true });
  const haikuFiles = await fs.readdir(inputDir);
  console.log("file count: ", haikuFiles.length);

  // first pass, analyze all metadata
  for (const haikuFile of haikuFiles) {
    await fs.readFile(path.resolve(inputDir, haikuFile), "utf-8").then(async (data) => {
      const { headerLines } = fileToLines(data);

      // convert headerLines to yaml
      const { timeId } = handleHeaderLines(haikuFile, headerLines);
      const sourceFilename = haikuFile.replace(".haiku", "");
      filenameMap.set(sourceFilename, timeId);
    });
  }

  assert(filenameMap.size === haikuFiles.length, "filenameMap size should match haikuFiles length");

  for (const haikuFile of haikuFiles) {
    await fs.readFile(path.resolve(inputDir, haikuFile), "utf-8").then(async (data) => {
      const { headerLines, bodyLines } = fileToLines(data);

      // convert headerLines to yaml
      const { frontmatter, timeId } = handleHeaderLines(haikuFile, headerLines);

      const body = handleBodyLines(haikuFile, bodyLines, filenameMap);

      // TODO pass through markdown and yaml parser

      // `wx` flag: fail if file exists
      await fs.writeFile(path.join(__dirname, `./output/${timeId}.md`), `${frontmatter}\n\n${body}\n`, { flag: "wx" });
    });
  }
}

main(inputDir);
