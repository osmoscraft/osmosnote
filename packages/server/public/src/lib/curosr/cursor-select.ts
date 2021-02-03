import { seek, SeekOutput } from "../dom-utils.js";
import {
  getLine,
  getLineMetrics,
  getNextLine,
  getOffsetByVisualPosition,
  getPreviousLine,
  VisualPosition,
} from "../line-query.js";
import { getCursor, getCursorLinePosition, getNearestEditablePositionForward } from "./cursor-query.js";
import { getIdealColumn, updateIdealColumn } from "./ideal-column.js";

export function renderDefaultCursor(root: HTMLElement) {
  const firstLine = document.querySelector("[data-line]") as HTMLElement;

  if (firstLine) {
    setCollapsedCursorToIdealPosition(
      firstLine,
      {
        row: 0,
        column: 0,
      },
      root
    );
  }
}

export function cursorRight(root: HTMLElement) {
  const cursorEnd = getCursor()?.end;
  if (!cursorEnd) return;

  const seekOuput = seek({ source: cursorEnd.node, offset: cursorEnd.offset, seek: 1, root });
  if (seekOuput) {
    const editablePosition = getNearestEditablePositionForward(seekOuput.node, seekOuput.offset);
    setCollapsedCursor(editablePosition.node, editablePosition.offset, root);
    updateIdealColumn();
  }
}

export function cursorLeft(root: HTMLElement) {
  const cursorEnd = getCursor()?.end;
  if (!cursorEnd) return;

  const seekOuput = seek({ source: cursorEnd.node, offset: cursorEnd.offset, seek: -1, root });
  if (seekOuput) {
    setCollapsedCursor(seekOuput.node, seekOuput.offset, root);
    updateIdealColumn();
  }
}

export function cursorDown(root: HTMLElement) {
  const cursorEnd = getCursor()?.end;

  if (cursorEnd) {
    const currentLine = getLine(cursorEnd.node)!;
    const { indent, lastRowIndex, isWrapped } = getLineMetrics(currentLine);
    const { offset: inlineOffset, row: cursorRow, column: cursorColumn } = getCursorLinePosition(cursorEnd);

    if (isWrapped) {
      if (inlineOffset < indent) {
        // Inside initial indent: Move to 1st wrapped line start
        setCollapsedCursorToIdealPosition(
          currentLine,
          {
            row: cursorRow + 1,
            column: indent,
          },
          root
        );

        return;
      } else if (cursorRow < lastRowIndex) {
        // Has wrapped line below: Move to next row
        setCollapsedCursorToIdealPosition(
          currentLine,
          {
            row: cursorRow + 1,
            column: cursorColumn,
          },
          root
        );

        return;
      }
    }

    const nextLine = getNextLine(currentLine);
    if (!nextLine) return;

    setCollapsedCursorToIdealPosition(
      nextLine,
      {
        row: 0,
        column: cursorColumn,
      },
      root
    );
  }
}

export function cursorUp(root: HTMLElement) {
  const cursorEnd = getCursor()?.end;

  if (cursorEnd) {
    const currentLine = getLine(cursorEnd.node)!;
    const { row: cursorRow, column: cursorColumn } = getCursorLinePosition(cursorEnd);

    // move up wrapped line
    if (cursorRow > 0) {
      setCollapsedCursorToIdealPosition(
        currentLine,
        {
          row: cursorRow - 1,
          column: cursorColumn,
        },
        root
      );

      return;
    }

    const previousLine = getPreviousLine(currentLine);
    if (!previousLine) return;

    // move to line above
    setCollapsedCursorToIdealPosition(
      previousLine,
      {
        row: getLineMetrics(previousLine).lastRowIndex,
        column: cursorColumn,
      },
      root
    );
  }
}

/**
 * Set cursor to the given row and column of the line.
 * Any previously remembered ideal column will override the given column.
 */
function setCollapsedCursorToIdealPosition(
  line: HTMLElement,
  fallbackPosition: VisualPosition,
  root: HTMLElement | null = null
): SeekOutput | null {
  const { row, column } = fallbackPosition;
  const targetOffset = getOffsetByVisualPosition(line, {
    row,
    column: getIdealColumn() ?? column,
  });

  const seekOutput = seek({ source: line, offset: targetOffset });
  if (seekOutput) {
    setCollapsedCursor(seekOutput.node, seekOutput.offset, root);
    return seekOutput;
  } else {
    return null;
  }
}

function setCollapsedCursor(node: Node, offset: number = 0, root: HTMLElement | null = null) {
  const selection = window.getSelection();

  if (selection) {
    if (selection.rangeCount) {
      selection.removeAllRanges();
    }

    const range = new Range();
    range.setEnd(node, offset);
    range.collapse();

    selection.addRange(range);
  }

  updateContainerState(root);
}

/**
 * Mark all parent elements of the cursor
 */
function updateContainerState(root: HTMLElement | Document | null = document) {
  // TODO improve perf by diffing the add/remove of dataset values
  // remove all previous states
  root?.querySelectorAll("[data-cursor-in]").forEach((container) => delete (container as HTMLElement).dataset.cursorIn);

  const cursor = getCursor();
  if (cursor) {
    updateContainerStateRecursive(cursor.end.node, root);
  }
}

function updateContainerStateRecursive(currentNode: Node | null, root: Node | null) {
  if (!currentNode) {
    return;
  } else {
    if ((currentNode as HTMLElement).dataset) {
      (currentNode as HTMLElement).dataset.cursorIn = "";
    }

    if (currentNode === root) return;

    updateContainerStateRecursive(currentNode.parentNode, root);
  }
}
