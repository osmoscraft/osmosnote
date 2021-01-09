import "jasmine";
import { tokenize } from "../src";
import * as fs from "fs-extra";
import * as path from "path";

describe("Tokenization", () => {
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
    const page = fs.readFileSync(path.join(__dirname, "./sample.txt"), "utf-8");
    const result = tokenize(page);

    expect(result.length).toBe(3);
  });
});
