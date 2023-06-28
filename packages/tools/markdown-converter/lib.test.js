import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileToLines, handleHeaderLines } from "./lib.js";

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
