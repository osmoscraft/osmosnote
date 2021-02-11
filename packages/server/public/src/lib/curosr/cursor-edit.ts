import { formatSyntaxOnly, isIndentSettingLine } from "../format.js";
import { getLine, getLineMetrics, getLines, getNextLine, getPreviousLine, sliceLine } from "../line/line-query.js";
import { LineElement, sourceToLines } from "../source-to-lines.js";
import { splice } from "../string.js";
import { getCursor, getCursorLinePosition } from "./cursor-query.js";
import {
  cursorEndSelect,
  cursorWordEndSelect,
  cursorWordStartSelect,
  setCollapsedCursorToLineOffset,
  setCollapsedCursorToLinePosition,
} from "./cursor-select.js";

export function insertText(text: string, root: HTMLElement) {
  deleteSelection(root);

  const cursor = getCursor();
  if (!cursor) return;

  const { offset } = getCursorLinePosition(cursor.focus);
  const currentLine = getLine(cursor.focus.node);
  if (!currentLine) return;

  const lineText = currentLine.textContent!;
  const lineUpdatedText = splice(lineText, offset, 0, text);
  const newLines = sourceToLines(lineUpdatedText);
  const updatedLine = newLines.children[0] as HTMLElement;

  currentLine.parentElement?.insertBefore(newLines, currentLine);
  currentLine.remove();

  formatSyntaxOnly(root);

  setCollapsedCursorToLineOffset({ line: updatedLine, offset: offset + text.length });
}

export function insertNewLine(root: HTMLElement) {
  deleteSelection(root);

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

  formatSyntaxOnly(root);

  // set cursor to next line start
  const lineMetrics = getLineMetrics(newSecondLine);
  setCollapsedCursorToLinePosition({
    line: newSecondLine,
    position: { row: 0, column: lineMetrics.indent },
  });
}

export function deleteBefore(root: HTMLElement) {
  const cursor = getCursor();
  if (!cursor) return;

  if (!cursor.isCollapsed) {
    deleteSelection(root);
    return;
  }

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

      formatSyntaxOnly(root);

      setCollapsedCursorToLineOffset({
        line: updatedPreviousLine,
        offset: previousLineText.length,
      });
    }
  } else {
    const remainingText = splice(currentLine.textContent!, offset - 1, 1);

    const newLines = sourceToLines(remainingText);
    const updatedLine = newLines.children[0] as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine);
    currentLine.remove();

    formatSyntaxOnly(root);

    // set cursor to the left edge of the deleted char
    setCollapsedCursorToLineOffset({
      line: updatedLine,
      offset: offset - 1,
    });
  }
}

export function deleteAfter(root: HTMLElement) {
  const cursor = getCursor();
  if (!cursor) return;

  if (!cursor.isCollapsed) {
    deleteSelection(root);
    return;
  }

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

    formatSyntaxOnly(root);

    setCollapsedCursorToLineOffset({ line: updatedLine, offset: offset });
  } else {
    const lineText = currentLine.textContent!;
    const lineRemainingText = splice(lineText, offset, 1);
    const newLines = sourceToLines(lineRemainingText);
    const updatedLine = newLines.children[0] as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine);
    currentLine.remove();

    formatSyntaxOnly(root);

    setCollapsedCursorToLineOffset({ line: updatedLine, offset: offset });
  }
}

export function deleteWordBefore(root: HTMLElement) {
  const cursor = getCursor();
  if (!cursor) return;

  if (!cursor.isCollapsed) {
    deleteSelection(root);
    return;
  }

  cursorWordStartSelect(root);
  deleteSelection(root);
}

export function deleteWordAfter(root: HTMLElement) {
  const cursor = getCursor();
  if (!cursor) return;

  if (!cursor.isCollapsed) {
    deleteSelection(root);
    return;
  }

  cursorWordEndSelect(root);
  deleteSelection(root);
}

/**
 * Delete selection if there is any. No op otherwise
 */
export function deleteSelection(root: HTMLElement) {
  const cursor = getCursor();
  if (!cursor) return;
  if (cursor.isCollapsed) return;

  const selectedLines = getLines(cursor.start.node, cursor.end.node);
  const { offset: cursorStartOffset } = getCursorLinePosition(cursor.start);
  const { offset: cursorEndOffset } = getCursorLinePosition(cursor.end);

  const isIndentDirty = selectedLines.some(isIndentReset);
  let updatedLine: HTMLElement | undefined = undefined;

  // if start and end are on the same line, update line content
  if (selectedLines.length === 1) {
    // remove content between start and end
    const currentLine = selectedLines[0];

    const lineText = currentLine.textContent!;
    const lineUpdatedText = lineText.slice(0, cursorStartOffset) + lineText.slice(cursorEndOffset);
    const newLines = sourceToLines(lineUpdatedText);
    updatedLine = newLines.children[0] as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine);
    currentLine.remove();
  } else if (selectedLines.length > 1) {
    const startLine = selectedLines[0];
    const startLineText = startLine.textContent!;

    const endLine = selectedLines[selectedLines.length - 1];
    const endLineText = endLine.textContent!;

    const joinedLineText = startLineText.slice(0, cursorStartOffset) + endLineText.slice(cursorEndOffset);
    const newLines = sourceToLines(joinedLineText);
    updatedLine = newLines.children[0] as HTMLElement;

    startLine.parentElement?.insertBefore(updatedLine, startLine);
    selectedLines.forEach((line) => line.remove());
  }

  if (!updatedLine) {
    console.error("There must be at least one selected lines when cursor is not collapsed.");
    return;
  }

  formatSyntaxOnly(root);
  setCollapsedCursorToLineOffset({ line: updatedLine, offset: cursorStartOffset });

  if (isIndentDirty && updatedLine) {
    let dirtyLine = getNextLine(updatedLine);
    while (dirtyLine && !isIndentReset(dirtyLine)) {
      (dirtyLine as LineElement).dataset.dirtyIndent = "";
      dirtyLine = getNextLine(dirtyLine);
    }
  }
}

function isIndentReset(line: HTMLElement): boolean {
  return isIndentSettingLine((line as LineElement).dataset?.line);
}
