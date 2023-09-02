import fs from "fs/promises";
import path from "path";
import { fileToLines, handleBodyLines, handleHeaderLines } from "./lib.js";
const __dirname = path.resolve();
const inputDir = path.resolve(__dirname, "./input");

// console.warn = () => {};

async function main(inputDir) {
  try {
    // clear output
    await fs.rm(path.resolve(__dirname, "./output"), { force: true, recursive: true });
  } catch {}

  fs.mkdir(path.resolve(__dirname, "./output"), { recursive: true });
  const haikuFiles = await fs.readdir(inputDir);
  console.log("file count: ", haikuFiles.length);

  for (const haikuFile of haikuFiles) {
    await fs.readFile(path.resolve(inputDir, haikuFile), "utf-8").then(async (data) => {
      const { headerLines, bodyLines } = fileToLines(data);

      // convert headerLines to yaml
      const { frontmatter, timeId } = handleHeaderLines(haikuFile, headerLines);
      const body = handleBodyLines(haikuFile, bodyLines);

      // TODO pass through markdown and yaml parser

      // `wx` flag: fail if file exists
      await fs.writeFile(path.join(__dirname, `./output/${timeId}.md`), `${frontmatter}\n\n${body}\n`, { flag: "wx" });
    });
  }
}

main(inputDir);
