import { formatAll } from "../format.js";
import { getLine, getLineMetrics, sliceLine } from "../line-query.js";
import { sourceToLines } from "../source-to-lines.js";
import { getCursor, getCursorLinePosition } from "./cursor-query.js";
import { setCollapsedCursorToLinePosition } from "./cursor-select.js";
import { updateIdealColumn } from "./ideal-column.js";

export function insertNewLine() {
  const cursor = getCursor();
  if (!cursor) return;

  const { offset } = getCursorLinePosition(cursor.end);
  const currentLine = getLine(cursor.end.node);
  if (!currentLine) return;

  const textBefore = sliceLine(currentLine, 0, offset);
  const textAfter = sliceLine(currentLine, offset);

  const textAfterInline = textAfter.slice(0, -1); // we can guarantee there is "\n" in it
  const newLines = sourceToLines(textBefore + "\n" + textAfterInline);
  const newSecondLine = newLines.children[1] as HTMLElement;

  // TODO disable indentation formating
  formatAll(newLines);

  currentLine.parentElement?.insertBefore(newLines, currentLine);
  currentLine.remove();

  // set cursor to next line start
  const lineMetrics = getLineMetrics(newSecondLine);
  setCollapsedCursorToLinePosition(newSecondLine, { row: 0, column: lineMetrics.indent });
  updateIdealColumn();

  // TODO reformat indentation from last known context above
}
