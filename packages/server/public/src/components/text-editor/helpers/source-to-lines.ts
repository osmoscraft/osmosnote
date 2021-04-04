import { SRC_LINE_END, UI_LINE_END } from "../../../utils/special-characters.js";
import { removeLineEnding } from "./string.js";

export type LineType = "" | "heading" | "meta" | "list" | "blank";

export interface LineElement extends HTMLDivElement {
  dataset: {
    line: LineType;
    /** Exists on heading lines */
    headingLevel?: string;
    /** Exists on list item lines */
    list?: "ordered" | "unordered";
    /** The "bullet" or the number prefix of a list item, without surrounding space */
    listMarker?: string;
    listLevel?: string;
    /** For list item that contains only the marker */
    listEmpty?: string;
    /** Exists on meta lines */
    meta?: "title" | "tags";
    /** Line state */
    parsed?: "";
    /** Exists on the line that has collapsed caret */
    caretCollapsed?: "";
  };
}

export function sourceToLines(source: string) {
  const result = document.createDocumentFragment();

  // This can handle both src and ui line endings
  const trimmedLines = removeLineEnding(source).replaceAll(SRC_LINE_END, UI_LINE_END);
  const lines = trimmedLines.split(UI_LINE_END);

  lines.forEach((line) => {
    const lineDom = document.createElement("div") as LineElement;
    lineDom.dataset.line = "";
    lineDom.textContent = line;

    result.appendChild(lineDom);
  });

  return result;
}
