import { getCursor, getCursorLinePosition } from "../curosr/cursor-query.js";
import { getLine } from "../line/line-query.js";
import type { Snapshot } from "./history-service.js";

export function getSnapshot(root: HTMLElement): Snapshot {
  const documentHtml = root.innerHTML;
  const lines = [...root.querySelectorAll("[data-line]")] as HTMLElement[];

  const cursor = getCursor();
  if (cursor) {
    const currentLine = getLine(cursor.focus.node)!;
    const { offset: cursorOffset } = getCursorLinePosition(cursor.focus);

    return {
      documentHtml: documentHtml,
      cursorLineIndex: lines.indexOf(currentLine),
      cursorLineOffset: cursorOffset,
    };
  } else {
    return {
      documentHtml: documentHtml,
      cursorLineIndex: 0,
      cursorLineOffset: 0,
    };
  }
}
