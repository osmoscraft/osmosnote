const path = require("path");
const fs = require("fs/promises");
const assert = require("assert");
const inputDir = path.resolve(__dirname, "./input");

console.log(inputDir);

async function main(inputDir) {
  try {
    // clear output
    await fs.rm(path.resolve(__dirname, "./output"), { force: true, recursive: true });
  } catch {}

  fs.mkdir(path.resolve(__dirname, "./output"), { recursive: true });
  const haikuFiles = await fs.readdir(inputDir);
  console.log(haikuFiles);

  for (const haikuFile of haikuFiles) {
    await fs.readFile(path.resolve(inputDir, haikuFile), "utf-8").then(async (data) => {
      const allLines = data.split("\n");
      const headerLines = [];
      const bodyLines = [];

      while (allLines.length) {
        const line = allLines.shift();
        if (line.startsWith("#+")) {
          headerLines.push(line);
        } else {
          bodyLines.push(line);
        }
      }

      // convert headerLines to yaml
      const frontmatterLines = headerLines.map((line) => {
        let [_, key, value] = line.match(/^#\+(.*):\s(.*)$/);

        assert(!value.includes(`"`), `${value} contains double quotes`);
        if (value.includes(`: `)) {
          value = `"${value}"`;
        }

        if (key === "tags") {
          return `${key}: [${value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .join(", ")}]`;
        }
        return `${key}: ${value}`;
      });

      const frontmatter = `---\n${frontmatterLines.join("\n")}\n---\n`;

      // trim bodyLines
      while (bodyLines[0]?.trim() === "") {
        bodyLines.shift();
      }
      while (bodyLines.at(-1)?.trim() === "") {
        bodyLines.pop();
      }

      // convert bodyLines to markdown lines
      const markdownLines = bodyLines.map((line) => {
        if (line.startsWith("#")) {
          // convert title as is
          return line;
        } else if (line.match(/^(-+\d\.) (.*)$/)) {
          const [_, prefix, digit, text] = line.match(/^(-*)(\d+\.) (.*)$/);
          const order = parseInt(digit);
          assert(typeof order === "number", `${line} has non-numeric ordered list item ${_}`);
          assert(order < 10, `${line} has two digit ordered list item ${_}`);
          return `${"   ".repeat(prefix.length)}${digit}. ${text}`;
        } else if (line.match(/^(-+) (.*)$/)) {
          const [_, prefix, text] = line.match(/^(-+) (.*)$/);
          return `${"  ".repeat(prefix.length - 1)}- ${text}`;
        }

        // multiline quotes

        // relative link url

        // TODO Add two spaces to the line before paragraph lines

        return line;
      });

      const bodyText = markdownLines.join("\n");

      // console.log(haikuFile);
      // console.log(frontmatter);
      // console.log(bodyText);

      assert(frontmatterLines.length > 0, `${haikuFile} has no frontmatter`);

      if (!bodyText.length) {
        console.warn(`${haikuFile} has no body text`);
      }

      // TODO pass through markdown and yaml parser

      await fs.writeFile(
        path.join(__dirname, `./output/${haikuFile.replace(".haiku", ".md")}`),
        `${frontmatter}\n${bodyText}\n`
      );
    });
  }
}

main(inputDir);
