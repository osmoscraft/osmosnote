import assert from "node:assert/strict";
import yaml from "yaml";

/**
 * @param {string} content
 * @returns {{headerLines: string[], bodyLines: string[]}}
 */
export function fileToLines(content) {
  const allLines = content.split("\n");
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

  return { headerLines, bodyLines };
}

/**
 * @param {string[]} headerLines
 */
export function handleHeaderLines(haikuFile, headerLines) {
  const frontmatterLines = headerLines
    .map((line) => {
      let [_, key, value] = line.match(/^#\+(.+?):\s(.*)$/);

      value = value.trim();

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
  assert(parsedYaml.created, `${haikuFile} has no timestamp`);
  const timeId = new Date(parsedYaml.created).toISOString().replace(/-|T|:/g, "").slice(0, 14);

  const frontmatter = `---\n${frontmatterLines.join("\n")}\n---`;

  return { timeId, frontmatter };
}

/**
 * @param {string[]} bodyLines
 */
export function handleBodyLines(haikuFile, bodyLines) {
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
        assert(!line.startsWith("* "), `${haikuFile} "${line}" has asterisk list item`);
        assert(!line.startsWith("+ "), `${haikuFile} "${line}" has plus list item`);
        return {
          type: "PARAGRAPH",
          line: line.trim(),
        };
      }
    }
  });

  const normalizedLines = interBlockFormat(haikuFile, astLines);

  // TODO
  // relative link url

  const markdownLines = normalizedLines.map((astLine) => astLine.line);

  const bodyText = markdownLines.join("\n");

  if (bodyText.includes("```")) {
    console.log(`[code block] ${haikuFile} has code block`);
  }

  if (!bodyText.length) {
    console.log(`[no body text] ${haikuFile} has no body text`);
  }

  return bodyText;
}

export function interBlockFormat(haikuFile, astLines = []) {
  const normalizedLines = [];
  astLines.forEach((currentLine, index) => {
    const prevLine = astLines[index - 1];

    if (currentLine.type === "PARAGRAPH") {
      if (["HEADING", "ORDERED_LIST_ITEM", "UNORDERED_LIST_ITEM", "QUOTE"].includes(prevLine?.type)) {
        // Insert blank line before the paragraph:
        // - Heading -> Paragraph
        // - List item -> Paragraph
        // - Quote -> Paragraph
        normalizedLines.push(
          {
            type: "BLANK_LINE",
            line: "",
          },
          currentLine
        );
      } else if (prevLine?.type === "PARAGRAPH") {
        // Insert two spaces on the previous line:
        // - Paragraph -> Paragraph
        prevLine.line += "  ";
        normalizedLines.push(currentLine);
      } else if (prevLine?.type === "BLANK_LINE" || prevLine === undefined) {
        // Noop
        // - blank line -> Paragraph
        // - Start of file -> Paragraph
        normalizedLines.push(currentLine);
      } else {
        throw new Error(`${haikuFile} "${currentLine.line}" has illegal previous line`);
      }
    } else if (currentLine.type === "QUOTE") {
      // Insert two spaces on the previous line:
      // - Blockquote -> Blockquote
      if (prevLine?.type === "QUOTE") {
        prevLine.line += "  ";
        normalizedLines.push(currentLine);
      } else {
        normalizedLines.push(currentLine);
      }
    } else {
      normalizedLines.push(currentLine);
    }
  });

  return normalizedLines;
}
