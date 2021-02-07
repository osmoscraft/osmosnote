import { seek, SeekOutput } from "../dom-utils.js";
import {
  getLine,
  getLineStartPosition,
  getNextLine,
  isAfterLineEnd,
  Position,
  getNodeLinePosition,
  getLineMetrics,
  VisualPosition,
  getOffsetByVisualPosition,
  getPreviousLine,
} from "../line/line-query.js";
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

function getCursorSmartLinePosition(line: HTMLElement, fallbackPosition: VisualPosition): SeekOutput | null {
  const cursor = getCursor();
  if (!cursor) return null;
  const { anchor } = cursor;

  const { row, column } = fallbackPosition;
  const targetOffset = getOffsetByVisualPosition(line, {
    row,
    column: getIdealColumn() ?? column,
  });

  const newFocus = seek({ source: line, offset: targetOffset });
  if (newFocus) {
    const selection = window.getSelection()!;
    selection.setBaseAndExtent(anchor.node, anchor.offset, newFocus.node, newFocus.offset);

    return newFocus;
  } else {
    return null;
  }
}

export function getNearestEditablePositionForward(node: Text, offset: number) {
  if (isAfterLineEnd(node, offset)) {
    // if beyond line end
    const currentLine = getLine(node)!;
    const nextLine = getNextLine(currentLine);
    if (nextLine) {
      // go to next line start
      return getLineStartPosition(nextLine);
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
