import { seek, SeekOutput } from "../dom-utils.js";
import {
  getLine,
  seekToLineStart,
  getNextLine,
  isAfterLineEnd,
  Position,
  getNodeLinePosition,
  getLineMetrics,
  VisualPosition,
  getOffsetByVisualPosition,
  getPreviousLine,
  sliceLine,
  getReversedLine,
  seekToIndentEnd,
  seekToLineEnd,
} from "../line/line-query.js";
import { ensureLineEnding, removeLineEnding, reverse } from "../string.js";
import { getIdealColumn } from "./ideal-column.js";

export interface Cursor {
  anchor: CursorPosition;
  focus: CursorPosition;
  isCollapsed: boolean;
}

export interface CursorPosition {
  node: Node;
  offset: number;
}

export function getCursorLinePosition(cursorPosition: CursorPosition): Position {
  const { node, offset } = cursorPosition;
  const position = getNodeLinePosition(node, offset);
  return position;
}

export function getCursor(): Cursor | null {
  const selection = window.getSelection();
  if (!selection) return null;

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  if (!anchorNode || !focusNode) return null;

  return {
    anchor: {
      node: anchorNode,
      offset: anchorOffset,
    },
    focus: {
      node: focusNode,
      offset: focusOffset,
    },
    isCollapsed: selection.isCollapsed,
  };
}

export function getDefaultCursorPosition(): SeekOutput | null {
  const firstLine = document.querySelector("[data-line]") as HTMLElement;

  if (!firstLine) return null;

  return seekToLineStart(firstLine);
}

/**
 * Get the position of the next word end.
 * If the cursor starts at a word end, the search will start from next character
 * If no word end found, null is returned
 */
export function getWordEndPositionFromCursor(cursor: Cursor): SeekOutput | null {
  const currentLine = getLine(cursor.focus.node)!;
  const currentLineMetrics = getLineMetrics(currentLine);
  const { offset: cursorOffset } = getCursorLinePosition(cursor.focus);

  if (cursorOffset === currentLineMetrics.selectableLength) {
    // if at line end, search next line
    const nextLine = getNextLine(currentLine);
    if (nextLine) {
      const wordEndOffset = getWordEndOffset(nextLine.textContent!);
      const foundPosition = seek({ source: nextLine, offset: wordEndOffset })!;
      return foundPosition;
    }
  } else {
    // search current line (a result is guaranteed)
    const textAfterCursor = sliceLine(currentLine, cursorOffset);
    const wordEndOffset = getWordEndOffset(textAfterCursor);
    const foundPosition = seek({ source: currentLine, offset: cursorOffset + wordEndOffset })!;
    return foundPosition;
  }

  return null;
}

export function getWordStartPositionFromCursor(cursor: Cursor): SeekOutput | null {
  const currentLine = getLine(cursor.focus.node)!;
  const { offset: cursorOffset } = getCursorLinePosition(cursor.focus);

  if (cursorOffset === 0) {
    // if at line start, search previous line
    const previousLine = getPreviousLine(currentLine);
    if (previousLine) {
      const previousLineBackward = getReversedLine(previousLine);
      const wordEndOffsetBackward = getWordEndOffset(previousLineBackward);
      const previousLineMetrics = getLineMetrics(previousLine);
      const wordEndOffset = previousLineMetrics.selectableLength - wordEndOffsetBackward;
      const foundPosition = seek({ source: previousLine, offset: wordEndOffset })!;
      return foundPosition;
    }
  } else {
    // search current line (a result is guaranteed)
    const textBeforeCursorBackward = ensureLineEnding(reverse(sliceLine(currentLine, 0, cursorOffset)));
    const wordEndOffsetBackward = getWordEndOffset(textBeforeCursorBackward);
    const foundPosition = seek({ source: currentLine, offset: cursorOffset - wordEndOffsetBackward })!;
    return foundPosition;
  }

  return null;
}

/**
 * If after indent, get indent end position
 * If within indent, get line start
 * If at line start, return null
 */
export function getHomePositionFromCursor(cursor: Cursor): SeekOutput | null {
  const currentLine = getLine(cursor.focus.node)!;
  const { offset: cursorOffset } = getCursorLinePosition(cursor.focus);
  const currentLineMetrics = getLineMetrics(currentLine);

  if (cursorOffset > currentLineMetrics.indent) {
    // if after indent, move to indent
    return seekToIndentEnd(currentLine);
  } else if (cursorOffset > 0) {
    // if within indent, move to line start
    return seekToLineStart(currentLine);
  } else {
    return null;
  }
}

/**
 * If before line end, get line end
 * If at line end, return null
 */
export function getEndPositionFromCursor(cursor: Cursor): SeekOutput | null {
  const currentLine = getLine(cursor.focus.node)!;
  const { offset: cursorOffset } = getCursorLinePosition(cursor.focus);
  const currentLineMetrics = getLineMetrics(currentLine);

  if (cursorOffset < currentLineMetrics.selectableLength) {
    return seekToLineEnd(currentLine);
  } else {
    return null;
  }
}

/**
 * The input must ends with a new line character
 */
function getWordEndOffset(text: string): number {
  let wordEndMatch = text.match(/^(\s*?)(\w+|[^\w\s]+)(\w|\s|[^\w\s])/);
  if (wordEndMatch) {
    const [raw, spaces, chunk, suffix] = wordEndMatch;
    const moveDistance = spaces.length + chunk.length;
    return moveDistance;
  }

  return text.length;
}

export function getPositionAboveCursor(cursor: Cursor): SeekOutput | null {
  const currentLine = getLine(cursor.focus.node)!;
  const { row: cursorRow, column: cursorColumn } = getCursorLinePosition(cursor.focus);

  // wrapped line above
  if (cursorRow > 0) {
    return getCursorSmartLinePosition(currentLine, {
      row: cursorRow - 1,
      column: cursorColumn,
    });
  }

  const previousLine = getPreviousLine(currentLine);
  if (!previousLine) return null;

  // line above
  return getCursorSmartLinePosition(previousLine, {
    row: getLineMetrics(previousLine).lastRowIndex,
    column: cursorColumn,
  });
}

export function getPositionBelowCursor(cursor: Cursor): SeekOutput | null {
  const currentLine = getLine(cursor.focus.node)!;
  const { indent, lastRowIndex, isWrapped } = getLineMetrics(currentLine);
  const { offset: inlineOffset, row: cursorRow, column: cursorColumn } = getCursorLinePosition(cursor.focus);

  if (isWrapped) {
    if (inlineOffset < indent) {
      // (inside initial indent) 1st wrapped line below
      return getCursorSmartLinePosition(currentLine, {
        row: cursorRow + 1,
        column: indent,
      });
    } else if (cursorRow < lastRowIndex) {
      // wrapped line below:
      return getCursorSmartLinePosition(currentLine, {
        row: cursorRow + 1,
        column: cursorColumn,
      });
    }
  }

  const nextLine = getNextLine(currentLine);
  if (!nextLine) return null;

  return getCursorSmartLinePosition(nextLine, {
    row: 0,
    column: cursorColumn,
  });
}

/**
 * Locate cursor to the given row and column of the line.
 * Any previously saved ideal column will override the given column.
 */
function getCursorSmartLinePosition(line: HTMLElement, fallbackPosition: VisualPosition): SeekOutput | null {
  const { row, column } = fallbackPosition;
  const targetOffset = getOffsetByVisualPosition(line, {
    row,
    column: getIdealColumn() ?? column,
  });

  const newFocus = seek({ source: line, offset: targetOffset });
  return newFocus;
}

export function getNearestEditablePositionForward(node: Text, offset: number) {
  if (isAfterLineEnd(node, offset)) {
    // if beyond line end
    const currentLine = getLine(node)!;
    const nextLine = getNextLine(currentLine);
    if (nextLine) {
      // go to next line start
      return seekToLineStart(nextLine);
    } else {
      // if no next line, back to this line end before new line character
      return {
        node,
        offset: offset - 1,
      };
    }
  } else {
    return {
      node,
      offset,
    };
  }
}
