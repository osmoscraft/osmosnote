import { formatAll } from "../format.js";
import { getLine, getLineMetrics, getPositionByOffset, getPreviousLine, sliceLine } from "../line-query.js";
import { sourceToLines } from "../source-to-lines.js";
import { getCursor, getCursorLinePosition } from "./cursor-query.js";
import { setCollapsedCursorToLinePosition } from "./cursor-select.js";
import { updateIdealColumn } from "./ideal-column.js";

export function insertNewLine(root: HTMLElement) {
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

  currentLine.parentElement?.insertBefore(newLines, currentLine);
  currentLine.remove();

  formatAll(root);

  // set cursor to next line start
  const lineMetrics = getLineMetrics(newSecondLine);
  setCollapsedCursorToLinePosition(newSecondLine, { row: 0, column: lineMetrics.indent });
  updateIdealColumn();
}

export function deleteBefore(root: HTMLElement) {
  const cursor = getCursor();
  if (!cursor) return;

  const { offset } = getCursorLinePosition(cursor.end);
  const currentLine = getLine(cursor.end.node);
  if (!currentLine) return;

  if (offset === 0) {
    // at line start. Move rest of line content to the end of line above
    const previousLine = getPreviousLine(currentLine);
    if (previousLine) {
      const previousLineText = sliceLine(previousLine, 0, -1); // remove \n
      const currentLineRemainingText = sliceLine(currentLine, 0, -1); // remove \n
      const newlines = sourceToLines(previousLineText + currentLineRemainingText);
      const updatedPreviousLine = newlines.children[0] as HTMLElement;

      const previousLineMetrics = getLineMetrics(previousLine);
      const previousLineEnd = getPositionByOffset(previousLine, previousLineMetrics.selectableLength);

      currentLine.remove();
      previousLine.parentElement?.insertBefore(newlines, previousLine);
      previousLine.remove();

      formatAll(root);

      setCollapsedCursorToLinePosition(updatedPreviousLine, {
        row: previousLineEnd.row,
        column: previousLineEnd.column,
      });
      updateIdealColumn();
    }
  } else {
    const remainingText = sliceLine(currentLine, 0, offset - 1) + sliceLine(currentLine, offset, -1); // remove \n

    const newLines = sourceToLines(remainingText);
    const updatedLine = newLines.children[0] as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine);
    currentLine.remove();

    formatAll(root, { preserveIndent: true });

    // set cursor to the left edge of the deleted char
    const newPosition = getPositionByOffset(updatedLine, offset - 1);
    setCollapsedCursorToLinePosition(updatedLine, {
      ...newPosition,
    });
    updateIdealColumn();
  }
}
