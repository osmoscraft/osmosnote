import { tokenize } from "../src";
import { describe, it, expect } from "./helpers";
import fs from "fs-extra";
import path from "path";

describe("Tokenization", async () => {
  it("tokenizes empty page", () => {
    const page = "";
    const result = tokenize(page);

    expect(result.length).toBe(0);
  });

  it("tokenizes empty line", () => {
    const page = "\n";

    const result = tokenize(page);

    expect(result.length).toBe(1);
  });

  it("tokenizes sample file", () => {
    const page = fs.readFileSync(path.join(__dirname, "./sample-01-input.txt"), "utf-8");
    const result = tokenize(page);

    expect(result.length).toBe(3);
  });
});
