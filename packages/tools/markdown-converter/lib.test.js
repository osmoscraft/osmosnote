import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileToLines, handleBodyLines, handleHeaderLines } from "./lib.js";

describe("header", () => {
  it("throw on empty header", () => {
    assert.throws(() => handleHeaderLines("", fileToLines(``).headerLines));
  });

  it("partial field", () => {
    assert.throws(() => handleHeaderLines("", fileToLines(`#+title`).headerLines));
    assert.throws(() => handleHeaderLines("", fileToLines(`#+title:`).headerLines));
  });

  it("missing timestamp", () => {
    assert.throws(() => handleHeaderLines("", fileToLines(`#+title: hello`).headerLines));
  });

  it("title", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: Basic title\n#+created: 2000-01-01T00:00:00Z`).headerLines)
        .frontmatter,
      `---\ntitle: Basic title\ncreated: 2000-01-01T00:00:00Z\n---`
    );
  });

  it("title with surrounding space", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title:   Basic title  \n#+created: 2000-01-01T00:00:00Z`).headerLines)
        .frontmatter,
      `---\ntitle: Basic title\ncreated: 2000-01-01T00:00:00Z\n---`
    );
  });

  it("title that contains quotes", () => {
    assert.throws(() =>
      handleHeaderLines("", fileToLines(`#+title: "hello"\n#+created: 2000-01-01T00:00:00Z`).headerLines)
    );
  });

  it("title with colon", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: Key: Value\n#+created: 2000-01-01T00:00:00Z`).headerLines)
        .frontmatter,
      `---\ntitle: \"Key: Value\"\ncreated: 2000-01-01T00:00:00Z\n---`
    );
  });

  it("coverts date", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+created: 2023-08-19T23:59:59-07:00`).headerLines)
        .frontmatter,
      `---\ntitle: hello\ncreated: 2023-08-19T23:59:59-07:00\n---`
    );
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+created: 2023-08-19T00:00:01+07:00`).headerLines)
        .frontmatter,
      `---\ntitle: hello\ncreated: 2023-08-19T00:00:01+07:00\n---`
    );
  });

  it("extracts time id from metadata", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+created: 2023-08-19T23:59:59Z`).headerLines).timeId,
      `20230819235959`
    );
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+created: 2023-08-19T23:59:59-01:00`).headerLines).timeId,
      `20230820005959`
    );
  });

  it("empty tags", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+tags: \n#+created: 2000-01-01T00:00:00Z`).headerLines)
        .frontmatter,
      `---\ntitle: hello\ncreated: 2000-01-01T00:00:00Z\n---`
    );
  });

  it("basic tags", () => {
    assert.strictEqual(
      handleHeaderLines(
        "",
        fileToLines(`#+title: hello\n#+tags: hello, world\n#+created: 2000-01-01T00:00:00Z`).headerLines
      ).frontmatter,
      `---\ntitle: hello\ntags: [hello, world]\ncreated: 2000-01-01T00:00:00Z\n---`
    );
  });

  it("tags with irregular spaces", () => {
    assert.strictEqual(
      handleHeaderLines(
        "",
        fileToLines(`#+title: hello\n#+tags:   hello  ,  world \n#+created: 2000-01-01T00:00:00Z`).headerLines
      ).frontmatter,
      `---\ntitle: hello\ntags: [hello, world]\ncreated: 2000-01-01T00:00:00Z\n---`
    );
  });

  it("handles URL", () => {
    assert.strictEqual(
      handleHeaderLines(
        "",
        fileToLines(`#+title: hello\n#+created: 2000-01-01T00:00:00Z\n#+url: https://test.com/?q=32`).headerLines
      ).frontmatter,
      `---\ntitle: hello\ncreated: 2000-01-01T00:00:00Z\nurl: https://test.com/?q=32\n---`
    );
  });
});

describe("body", () => {
  it("handles basic list", () => {
    assert.strictEqual(handleBodyLines("", fileToLines(`- item\n- item\n- item`).bodyLines), `- item\n- item\n- item`);
  });
  it("handles nested list", () => {
    assert.strictEqual(
      handleBodyLines("", fileToLines(`- item\n-- item\n--- item`).bodyLines),
      `- item\n  - item\n    - item`
    );
  });
  it("handles ordered list", () => {
    assert.strictEqual(
      handleBodyLines("", fileToLines(`1. item\n2. item\n3. item`).bodyLines),
      `- 1. item\n- 2. item\n- 3. item`
    );
  });
  it("handles nested ordered list", () => {
    assert.strictEqual(
      handleBodyLines("", fileToLines(`1. item\n-1. item\n--1. item`).bodyLines),
      `- 1. item\n  - 1. item\n    - 1. item`
    );
  });
  it("invalid lists", () => {
    assert.throws(() => handleBodyLines("", fileToLines(`+ item`).bodyLines));
    assert.throws(() => handleBodyLines("", fileToLines(`* item`).bodyLines));
  });
  it("handles quotes", () => {
    assert.strictEqual(handleBodyLines("", fileToLines(`> quote`).bodyLines), `> quote`);
  });
  it("handles heading", () => {
    assert.strictEqual(handleBodyLines("", fileToLines(`# heading`).bodyLines), `# heading`);
    assert.strictEqual(handleBodyLines("", fileToLines(`## heading`).bodyLines), `## heading`);
    assert.strictEqual(handleBodyLines("", fileToLines(`### heading`).bodyLines), `### heading`);
    assert.strictEqual(handleBodyLines("", fileToLines(`#### heading`).bodyLines), `#### heading`);
    assert.strictEqual(handleBodyLines("", fileToLines(`##### heading`).bodyLines), `##### heading`);
    assert.strictEqual(handleBodyLines("", fileToLines(`###### heading`).bodyLines), `###### heading`);
  });
});
