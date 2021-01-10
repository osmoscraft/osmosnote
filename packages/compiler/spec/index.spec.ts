import { parse } from "../src";
import { describe, it, expect } from "./helpers";
import fs from "fs-extra";
import path from "path";

describe("Tokenization: empty state", () => {
  it("tokenizes empty input", () => {
    const page = "";
    const result = parse(page);

    expect(result.type).toBe("root");
    expect(result.child.length).toBe(0);
  });
});

describe("Tokenization: single line", () => {
  it("tokenizes empty line", () => {
    const page = "\n";

    const result = parse(page);

    expect(result.child.length).toBe(1);
    expect(result.child[0].type).toBe("emptyLine");
  });

  it("tokenizers meta", () => {
    const page = "#+title: Hello, world!";

    const result = parse(page);

    expect(result.child.length).toBe(1);
    expect(result.child[0].type).toBe("meta");
  });

  it("tokenizers heading", () => {
    const page = "### Hello, world!";

    const result = parse(page);

    expect(result.child.length).toBe(1);
    expect(result.child[0].type).toBe("heading");
  });

  it("tokenizers paragraph", () => {
    const page = "Hello, world!";

    const result = parse(page);

    expect(result.child.length).toBe(1);
    expect(result.child[0].type).toBe("paragraph");
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
