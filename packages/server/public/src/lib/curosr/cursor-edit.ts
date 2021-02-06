import { formatAll } from "../format.js";
import { getLine, getLineMetrics, getNextLine, getPreviousLine, sliceLine } from "../line/line-query.js";
import { sourceToLines } from "../source-to-lines.js";
import { splice } from "../string.js";
import { getCursor, getCursorLinePosition } from "./cursor-query.js";
import { setCollapsedCursorToLineOffset, setCollapsedCursorToLinePosition } from "./cursor-select.js";
import { updateIdealColumn } from "./ideal-column.js";

export function insertNewLine(root: HTMLElement) {
  const cursor = getCursor();
  if (!cursor) return;

  const { offset } = getCursorLinePosition(cursor.focus);
  const currentLine = getLine(cursor.focus.node);
  if (!currentLine) return;

  const textBefore = sliceLine(currentLine, 0, offset);
  const textAfter = sliceLine(currentLine, offset);

  const newLines = sourceToLines(textBefore + "\n" + textAfter);
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

  const { offset } = getCursorLinePosition(cursor.focus);
  const currentLine = getLine(cursor.focus.node);
  if (!currentLine) return;

  if (offset === 0) {
    // at line start. Move rest of line content to the end of line above
    const previousLine = getPreviousLine(currentLine);
    if (previousLine) {
      const previousLineText = sliceLine(previousLine, 0, -1); // remove \n
      const currentLineRemainingText = currentLine.textContent;
      const newlines = sourceToLines(previousLineText + currentLineRemainingText);
      const updatedPreviousLine = newlines.children[0] as HTMLElement;

      currentLine.remove();
      previousLine.parentElement?.insertBefore(newlines, previousLine);
      previousLine.remove();

      formatAll(root);

      setCollapsedCursorToLineOffset(updatedPreviousLine, previousLineText.length);
      updateIdealColumn();
    }
  } else {
    const remainingText = splice(currentLine.textContent!, offset - 1, 1);

    const newLines = sourceToLines(remainingText);
    const updatedLine = newLines.children[0] as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine);
    currentLine.remove();

    formatAll(root, { preserveIndent: true });

    // set cursor to the left edge of the deleted char
    setCollapsedCursorToLineOffset(updatedLine, offset - 1);
    updateIdealColumn();
  }
}

export function deleteAfter(root: HTMLElement) {
  const cursor = getCursor();
  if (!cursor) return;

  const { offset } = getCursorLinePosition(cursor.focus);
  const currentLine = getLine(cursor.focus.node);
  if (!currentLine) return;

  const { selectableLength } = getLineMetrics(currentLine);
  if (offset === selectableLength) {
    const nextLine = getNextLine(currentLine);
    if (!nextLine) return;

    const nextLineText = nextLine.textContent!;
    const joinedLineText = currentLine.textContent!.slice(0, -1).concat(nextLineText);

    const newLines = sourceToLines(joinedLineText);
    const updatedLine = newLines.children[0] as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine);
    currentLine.remove();
    nextLine.remove();

    formatAll(root);

    setCollapsedCursorToLineOffset(updatedLine, offset);
    updateIdealColumn();
  } else {
    const lineText = currentLine.textContent!;
    const lineRemainingText = splice(lineText, offset, 1);
    const newLines = sourceToLines(lineRemainingText);
    const updatedLine = newLines.children[0] as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine);
    currentLine.remove();

    formatAll(root, { preserveIndent: true });

    setCollapsedCursorToLineOffset(updatedLine, offset);
    updateIdealColumn();
  }
}
