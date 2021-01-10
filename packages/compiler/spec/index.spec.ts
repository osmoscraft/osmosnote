import fs from "fs-extra";
import path from "path";
import { parse } from "../src";
import type { LineEmptyNode } from "../src/nodes/line-empty";
import type { LineHeadingNode } from "../src/nodes/line-heading";
import type { LineMetaNode } from "../src/nodes/line-meta";
import type { LineParagraphNode } from "../src/nodes/line-paragraph";
import { describe, expect, it } from "./helpers";

describe("Tokenization: empty state", () => {
  it("tokenizes empty input", () => {
    const page = "";
    const result = parse(page);

    expect(result.type).toBe("root");
    expect(result.childNodes.length).toBe(0);
  });
});

describe("Tokenization: single line", () => {
  it("tokenizes empty line", () => {
    const page = "\n";

    const result = parse(page);

    expect(result.childNodes.length).toBe(1);
    expect((result.childNodes[0] as LineEmptyNode).type).toBe("LineEmpty");
  });

  it("tokenizers meta", () => {
    const page = "#+title: Hello, world!";

    const result = parse(page);

    expect(result.childNodes.length).toBe(1);
    expect((result.childNodes[0] as LineMetaNode).type).toBe("LineMeta");
  });

  it("tokenizers heading", () => {
    const page = "### Hello, world!";

    const result = parse(page);

    expect(result.childNodes.length).toBe(1);
    expect((result.childNodes[0] as LineHeadingNode).type).toBe("LineHeading");
  });

  it("tokenizers paragraph", () => {
    const page = "Hello, world!";

    const result = parse(page);

    expect(result.childNodes.length).toBe(1);
    expect((result.childNodes[0] as LineParagraphNode).type).toBe("LineParagraph");
  });
});

describe("Tokenization: file", () => {
  it("tokenizes sample file", () => {
    expect(true).toBe(true);
    const page = fs.readFileSync(path.join(__dirname, "./sample-01-input.txt"), "utf-8");
    const result = parse(page);

    expect(JSON.stringify(result)).toBe(JSON.stringify(require("./sample-01-output")));
  });
});
