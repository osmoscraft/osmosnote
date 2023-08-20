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

  it("title", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: Basic title`).headerLines),
      `---\ntitle: Basic title\n---`
    );
  });

  it("title with surrounding space", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title:   Basic title  `).headerLines),
      `---\ntitle: Basic title\n---`
    );
  });

  it("title that contains quotes", () => {
    assert.throws(() => handleHeaderLines("", fileToLines(`#+title: "hello"`).headerLines));
  });

  it("title with colon", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: Key: Value`).headerLines),
      `---\ntitle: \"Key: Value\"\n---`
    );
  });

  it("coverts date", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+created: 2023-08-19T23:59:59-07:00`).headerLines),
      `---\ntitle: hello\ncreated: 2023-08-19\n---`
    );
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+created: 2023-08-19T00:00:01-07:00`).headerLines),
      `---\ntitle: hello\ncreated: 2023-08-19\n---`
    );
  });

  it("empty tags", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+tags: `).headerLines),
      `---\ntitle: hello\n---`
    );
  });

  it("basic tags", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+tags: hello, world`).headerLines),
      `---\ntitle: hello\ntags: [hello, world]\n---`
    );
  });

  it("tags with irregular spaces", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+tags:   hello  ,  world `).headerLines),
      `---\ntitle: hello\ntags: [hello, world]\n---`
    );
  });

  it("handles URL", () => {
    assert.strictEqual(
      handleHeaderLines("", fileToLines(`#+title: hello\n#+url: https://test.com/?q=32`).headerLines),
      `---\ntitle: hello\nurl: https://test.com/?q=32\n---`
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
