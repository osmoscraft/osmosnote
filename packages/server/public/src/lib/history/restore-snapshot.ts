import { setCollapsedCursorToLinePosition } from "../curosr/cursor-select.js";
import { getPositionByOffset } from "../line/line-query.js";
import type { Snapshot } from "./history-service.js";

export function restoreSnapshot(snapshot: Snapshot, root: HTMLElement) {
  // restore dom
  root.innerHTML = snapshot.documentHtml;

  // restore cursor
  const lines = [...root.querySelectorAll("[data-line]")] as HTMLElement[];
  const cursorLine = lines[snapshot.cursorLineIndex];
  const cursorPosition = getPositionByOffset(cursorLine, snapshot.cursorLineOffset);

  return setCollapsedCursorToLinePosition({
    line: cursorLine,
    position: {
      ...cursorPosition,
    },
    root,
    rememberColumn: true,
  });
}
