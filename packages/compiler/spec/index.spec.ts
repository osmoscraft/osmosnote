import { parse } from "../src/parse";
import { describe, expect, it } from "./helpers";
import fs from "fs-extra";
import path from "path";

describe("Tokenization: empty state", () => {
  it("tokenizes empty input", () => {
    const page = "";
    const root = parse(page)[0];
    expect(root.type).toBe("Root");
  });
});

describe("Tokenization: single line", () => {
  it("tokenizes empty line", () => {
    const page = "\n";

    const root = parse(page)[0];

    expect(root.children?.length).toBe(1);
    expect(root.children?.[0].type).toBe("BlankLine");
  });

  it("tokenizers heading", () => {
    const page = "### Hello, world!";

    const root = parse(page)[0];

    expect(root.children?.length).toBe(1);
    expect(root.children?.[0].type).toBe("HeadingLine");
  });

  it("tokenizers meta", () => {
    const page = "#+title: Hello, world!";

    const root = parse(page)[0];

    expect(root.children?.length).toBe(1);
    expect(root.children?.[0].type).toBe("MetaLine");
  });

  it("tokenizers paragraph", () => {
    const page = "Hello, world!";

    const root = parse(page)[0];

    expect(root.children?.length).toBe(1);
    expect(root.children?.[0].type).toBe("ParagraphLine");
  });

  it("tokenizers paragraph with link", () => {
    const page = "Hello, world! [visit me](123456)";

    const root = parse(page)[0];

    expect(root.children?.length).toBe(1);
    expect(root.children?.[0].type).toBe("ParagraphLine");
    expect(root.children?.[0].children?.[0].type).toBe("TextInline");
    expect(root.children?.[0].children?.[1].type).toBe("LinkInline");
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
