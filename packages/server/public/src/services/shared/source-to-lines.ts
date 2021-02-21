import { removeLineEnding } from "./string.js";

export type LineType = "" | "heading" | "meta" | "blank";

export interface LineElement extends HTMLDivElement {
  dataset: {
    line: LineType;
    /** Exists on indent setting lines */
    level?: string;
    meta?: "title" | "tags";
    dirtySyntax?: "";
    dirtyIndent?: "";
    /** Exists on the line that has collapsed cursor */
    cursorCollapsed?: "";
  };
}

export function sourceToLines(source: string) {
  const result = document.createDocumentFragment();

  const trimmedLines = removeLineEnding(source);
  const lines = trimmedLines.split("\n");

  lines.forEach((line) => {
    const lineDom = document.createElement("div") as LineElement;
    lineDom.dataset.line = "";
    lineDom.dataset.dirtySyntax = "";
    lineDom.dataset.dirtyIndent = "";

    lineDom.textContent = `${line}\n`;

    result.appendChild(lineDom);
  });

  return result;
}
