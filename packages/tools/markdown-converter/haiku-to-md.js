const path = require("path");
const fs = require("fs/promises");
const assert = require("assert");
const inputDir = path.resolve(__dirname, "./input");
const yaml = require("yaml");

console.log(inputDir);

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
      const frontmatter = handleHeaderLines(haikuFile, headerLines);
      const body = handleBodyLines(haikuFile, bodyLines);

      // TODO pass through markdown and yaml parser

      await fs.writeFile(
        path.join(__dirname, `./output/${haikuFile.replace(".haiku", ".md")}`),
        `${frontmatter}\n${body}\n`
      );
    });
  }
}

/**
 * @param {string[]} headerLines
 */
function handleHeaderLines(haikuFile, headerLines) {
  const frontmatterLines = headerLines
    .map((line) => {
      let [_, key, value] = line.match(/^#\+(.+?):\s(.*)$/);

      assert(!value.includes(`"`), `${value} contains double quotes`);
      if (value.includes(`: `)) {
        console.log(`[colon in title] ${haikuFile} "${value}" contains colon`);
        value = `"${value}"`;
      }

      if (key === "tags") {
        const tags = value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

        if (!tags.length) {
          console.log(`[empty tag] ${haikuFile}`);
          return null;
        }

        return `${key}: [${tags.join(", ")}]`;
      }
      return `${key}: ${value}`;
    })
    .filter(Boolean);

  assert(frontmatterLines.length > 0, `${haikuFile} has no frontmatter`);

  const innerYaml = frontmatterLines.join("\n");
  let parsedYaml = {};
  try {
    parsedYaml = yaml.parse(innerYaml);
    if (parsedYaml.tags) {
      assert(Array.isArray(parsedYaml.tags), `${haikuFile} has non-array tags`);
      parsedYaml.tags.every((tag) => assert(typeof tag === "string", `${haikuFile} has non-string tag`));
    }

    if (parsedYaml.url) {
      assert(typeof parsedYaml.url === "string", `${haikuFile} has non-string url`);
      try {
        new URL(parsedYaml.url);
      } catch (e) {
        console.error(`${haikuFile} has invalid url`);
        throw e;
      }
    }
  } catch (e) {
    console.error(`${haikuFile} has invalid yaml`);
    throw e;
  }
  assert(parsedYaml.title, `${haikuFile} has no title`);

  const frontmatter = `---\n${frontmatterLines.join("\n")}\n---\n`;

  return frontmatter;
}

/**
 * @param {string[]} bodyLines
 */
function handleBodyLines(haikuFile, bodyLines) {
  // trim bodyLines
  while (bodyLines[0]?.trim() === "") {
    bodyLines.shift();
  }
  while (bodyLines.at(-1)?.trim() === "") {
    bodyLines.pop();
  }

  // 1st pass, annotate line with types
  const patterns = [
    [/^#+ /, "HEADING"],
    [/^(-*)(\d+)\. (.*)$/, "ORDERED_LIST_ITEM"],
    [/^(-+) (.*)$/, "UNORDERED_LIST_ITEM"],
    [/^> (.*)$/, "QUOTE"],
    [/^(\s)*$/, "BLANK_LINE"],
    [/^.+$/, "PARAGRAPH"],
  ];

  const astLines = bodyLines.map((line) => {
    const pattern = patterns.find(([pattern]) => line.match(pattern));
    assert(pattern, `${haikuFile} "${line}" has no matching pattern`);
    const match = line.match(pattern[0]);

    switch (pattern[1]) {
      case "HEADING": {
        return {
          type: "HEADING",
          line,
        };
      }
      case "ORDERED_LIST_ITEM": {
        const [_, prefix, digit, text] = match;
        const order = parseInt(digit);
        const depth = prefix.length;

        assert(typeof order === "number", `${haikuFile} "${line}" has non-numeric ordered list item ${_}`);
        assert(text.trim().length > 0, `${haikuFile} "${line}" has empty ordered list item text`);

        return {
          type: "ORDERED_LIST_ITEM",
          order,
          depth,
          line: `${"  ".repeat(depth)}- ${digit}. ${text}`,
        };
      }
      case "UNORDERED_LIST_ITEM": {
        const [_, prefix, text] = match;
        const depth = prefix.length - 1;

        assert(text.trim().length > 0, `${haikuFile} "${line}" has empty unordered list item text`);

        return {
          type: "UNORDERED_LIST_ITEM",
          depth,
          line: `${"  ".repeat(depth)}- ${text}`,
        };
      }
      case "QUOTE": {
        return {
          type: "QUOTE",
          line,
        };
      }
      case "BLANK_LINE": {
        assert(line.length === 0, `${haikuFile} "${line}" has non-empty blank line`);
        return {
          type: "BLANK_LINE",
          line: "",
        };
      }
      case "PARAGRAPH": {
        return {
          type: "PARAGRAPH",
          line: line.trim(),
        };
      }
    }
  });

  // TODO inter-line lint
  // multiline quotes
  // relative link url
  // TODO Add two spaces to the line before paragraph lines
  // increment of list item depth must be 1
  // ordered list cannot be nested under unordered list
  const markdownLines = astLines.map((astLine) => astLine.line);

  const bodyText = markdownLines.join("\n");

  if (!bodyText.length) {
    console.log(`[no body text] ${haikuFile} has no body text`);
  }

  return bodyText;
}

main(inputDir);
