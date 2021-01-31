import { seek } from "../dom-utils.js";
import {
  getLine,
  getLineMetrics,
  getNextLine,
  getOffsetByVisualPosition,
  getPreviousLine,
  Position,
  VisualPosition,
} from "../line-query.js";
import { getCursor, getCursorLinePosition, getNearestEditablePositionForward } from "./cursor-query.js";
import { getIdealColumn, updateIdealColumn } from "./ideal-column.js";

export function renderDefaultCursor() {
  const firstLine = document.querySelector("[data-line]") as HTMLElement;

  if (firstLine) {
    setCollapsedCursorToIdealPosition(firstLine, {
      row: 0,
      column: 0,
    });
  }
}

export function cursorRight(root: Node) {
  const cursorEnd = getCursor()?.end;
  if (!cursorEnd) return;

  const seekOuput = seek({ source: cursorEnd.node, offset: cursorEnd.offset, seek: 1, root });
  if (seekOuput) {
    const editablePosition = getNearestEditablePositionForward(seekOuput.node, seekOuput.offset);
    setCollapsedCursor(editablePosition.node, editablePosition.offset);
    updateIdealColumn();
  }
}

export function cursorLeft(root: Node) {
  const cursorEnd = getCursor()?.end;
  if (!cursorEnd) return;

  const seekOuput = seek({ source: cursorEnd.node, offset: cursorEnd.offset, seek: -1, root });
  if (seekOuput) {
    setCollapsedCursor(seekOuput.node, seekOuput.offset);
    updateIdealColumn();
  }
}

export function cursorDown() {
  const cursorEnd = getCursor()?.end;

  if (cursorEnd) {
    const currentLine = getLine(cursorEnd.node)!;
    const { indent, lastRowIndex, isWrapped } = getLineMetrics(currentLine);
    const { offset: inlineOffset, row: cursorRow, column: cursorColumn } = getCursorLinePosition(cursorEnd);

    if (isWrapped) {
      if (inlineOffset < indent) {
        // Inside initial indent: Move to 1st wrapped line start
        setCollapsedCursorToIdealPosition(currentLine, {
          row: cursorRow + 1,
          column: indent,
        });

        return;
      } else if (cursorRow < lastRowIndex) {
        // Has wrapped line below: Move to next row
        setCollapsedCursorToIdealPosition(currentLine, {
          row: cursorRow + 1,
          column: cursorColumn,
        });

        return;
      }
    }

    const nextLine = getNextLine(currentLine);
    if (!nextLine) return;

    setCollapsedCursorToIdealPosition(nextLine, {
      row: 0,
      column: cursorColumn,
    });
  }
}

export function cursorUp() {
  const cursorEnd = getCursor()?.end;

  if (cursorEnd) {
    const currentLine = getLine(cursorEnd.node)!;
    const { row: cursorRow, column: cursorColumn } = getCursorLinePosition(cursorEnd);

    // move up wrapped line
    if (cursorRow > 0) {
      setCollapsedCursorToIdealPosition(currentLine, {
        row: cursorRow - 1,
        column: cursorColumn,
      });

      return;
    }

    const previousLine = getPreviousLine(currentLine);
    if (!previousLine) return;

    // move to line above
    setCollapsedCursorToIdealPosition(previousLine, {
      row: getLineMetrics(previousLine).lastRowIndex,
      column: cursorColumn,
    });
  }
}

/**
 * Set cursor to the given row and column of the line.
 * Any previously remembered ideal column will override the given column.
 */
function setCollapsedCursorToIdealPosition(line: HTMLElement, fallbackPosition: VisualPosition) {
  const { row, column } = fallbackPosition;
  const targetOffset = getOffsetByVisualPosition(line, {
    row,
    column: getIdealColumn() ?? column,
  });

  const seekOuput = seek({ source: line, offset: targetOffset });
  if (seekOuput) setCollapsedCursor(seekOuput.node, seekOuput.offset);
}

function setCollapsedCursor(node: Node, offset: number = 0) {
  const selection = window.getSelection();

  if (!selection) return;

  if (selection.rangeCount) {
    selection.removeAllRanges();
  }

  const range = new Range();
  range.setEnd(node, offset);
  range.collapse();

  selection.addRange(range);
}
