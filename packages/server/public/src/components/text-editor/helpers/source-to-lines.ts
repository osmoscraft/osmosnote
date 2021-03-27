import { removeLineEnding } from "./string.js";

export type LineType = "" | "heading" | "meta" | "list" | "blank";

export interface LineElement extends HTMLDivElement {
  dataset: {
    line: LineType;
    /** Exists on heading lines */
    headingLevel?: string;
    /** Exists on list item lines */
    listType?: "ordered" | "unordered";
    listLevel?: string;
    /** Exists on meta lines */
    meta?: "title" | "tags";
    /** Line state */
    dirtySyntax?: "";
    dirtyIndent?: "";
    /** Exists on the line that has collapsed caret */
    caretCollapsed?: "";
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
