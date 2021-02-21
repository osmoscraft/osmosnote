import { getCursor, getCursorLinePosition } from "../../shared/curosr/cursor-query.js";
import { getLine } from "../../shared/line/line-query.js";
import type { LineElement } from "../../shared/source-to-lines.js";
import type { Snapshot } from "../history.service.js";

export function getSnapshot(root: HTMLElement): Snapshot {
  const lines = [...root.querySelectorAll("[data-line]")] as LineElement[];

  const documentHtml = root.innerHTML;
  const textContent = root.textContent ?? "";

  const cursor = getCursor();
  if (cursor) {
    const currentLine = getLine(cursor.focus.node)! as LineElement;
    const { offset: cursorOffset } = getCursorLinePosition(cursor.focus);

    return {
      documentHtml: documentHtml,
      textContent,
      cursorLineIndex: lines.indexOf(currentLine),
      cursorLineOffset: cursorOffset,
    };
  } else {
    return {
      documentHtml: documentHtml,
      textContent,
      cursorLineIndex: 0,
      cursorLineOffset: 0,
    };
  }
}
