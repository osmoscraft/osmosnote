import { seek, SeekOutput } from "../dom-utils.js";
import { getOffsetByVisualPosition, getPositionByOffset, VisualPosition } from "../line/line-query.js";
import {
  Cursor,
  getCursor,
  getNearestEditablePositionForward,
  getPositionAboveCursor,
  getPositionBelowCursor,
} from "./cursor-query.js";
import { getIdealColumn, updateIdealColumn } from "./ideal-column.js";

export function renderDefaultCursor(root: HTMLElement) {
  const firstLine = document.querySelector("[data-line]") as HTMLElement;

  if (firstLine) {
    setCollapsedCursorToSmartLinePosition(
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
  moveCursorCollapsedByOffset(1, root);
}

export function cursorSelectRight(root: HTMLElement) {
  extendCursorFocusByOffset(1, root);
}

export function cursorLeft(root: HTMLElement) {
  moveCursorCollapsedByOffset(-1, root);
}

export function cursorSelectLeft(root: HTMLElement) {
  extendCursorFocusByOffset(-1, root);
}

export function cursorDown(root: HTMLElement) {
  moveCursorCollapsed({
    seeker: getPositionBelowCursor,
    requireCollapseTo: "end",
    root,
  });
}

export function cursorSelectDown(root: HTMLElement) {
  extendCursorFocus(getPositionBelowCursor, root);
}

export function cursorUp(root: HTMLElement) {
  moveCursorCollapsed({
    seeker: getPositionAboveCursor,
    requireCollapseTo: "start",
    root,
  });
}

export function cursorSelectUp(root: HTMLElement) {
  extendCursorFocus(getPositionAboveCursor, root);
}

export function setCollapsedCursorToLineOffset(
  line: HTMLElement,
  offset: number,
  root: HTMLElement | null = null
): SeekOutput | null {
  const newPosition = getPositionByOffset(line, offset);
  return setCollapsedCursorToLinePosition(
    line,
    {
      ...newPosition,
    },
    root
  );
}

/**
 * Set cursor to the given row and column of the line.
 * Ignore any existing ideal position
 */
export function setCollapsedCursorToLinePosition(
  line: HTMLElement,
  position: VisualPosition,
  root: HTMLElement | null = null
): SeekOutput | null {
  const { row, column } = position;
  const targetOffset = getOffsetByVisualPosition(line, {
    row,
    column,
  });

  const seekOutput = seek({ source: line, offset: targetOffset });
  if (seekOutput) {
    setCursorCollapsed(seekOutput.node, seekOutput.offset, root);
    return seekOutput;
  } else {
    return null;
  }
}

export function setCursorCollapsed(node: Node, offset: number = 0, root: HTMLElement | null = null) {
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

  updateCursorDomTracker(root);
}

function extendCursorFocusByOffset(offset: number, root: HTMLElement | null = null) {
  const cursor = getCursor();
  if (!cursor) return;
  const { anchor, focus } = cursor;

  let newFocus = seek({ source: focus.node, offset: focus.offset, seek: offset, root });
  if (!newFocus) return;

  if (offset > 0) newFocus = getNearestEditablePositionForward(newFocus.node, newFocus.offset);

  const selection = window.getSelection()!;
  selection.setBaseAndExtent(anchor.node, anchor.offset, newFocus.node, newFocus.offset);

  updateIdealColumn();
  updateCursorDomTracker(root);
}

function extendCursorFocus(
  seeker: (cursor: Cursor) => SeekOutput | null,
  root: HTMLElement | null = null,
  saveIdealColumn = false
) {
  const cursor = getCursor();
  if (!cursor) return;
  const newFocus = seeker(cursor);
  if (!newFocus) return;

  const selection = window.getSelection()!;
  selection.setBaseAndExtent(cursor.anchor.node, cursor.anchor.offset, newFocus.node, newFocus.offset);

  if (saveIdealColumn) updateIdealColumn();
  updateCursorDomTracker(root);
}

/**
 * Set cursor to the given row and column of the line.
 * Any previously remembered ideal column will override the given column.
 */
function setCollapsedCursorToSmartLinePosition(
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
    setCursorCollapsed(seekOutput.node, seekOutput.offset, root);
    return seekOutput;
  } else {
    return null;
  }
}

/**
 * If already collapsed, move the cursor by offset.
 * If not collapsed, collapse to the direction of movement.
 */
function moveCursorCollapsedByOffset(offset: number, root: HTMLElement | null = null) {
  const cursor = getCursor();
  if (!cursor) return;
  const { focus, isCollapsed } = cursor;
  const selection = window.getSelection()!;
  if (!selection) return;

  if (!isCollapsed) {
    if (offset > 0) {
      selection.collapseToEnd();
    } else {
      selection.collapseToStart();
    }
  } else {
    let newFocus = seek({ source: focus.node, offset: focus.offset, seek: offset, root });
    if (!newFocus) return;

    if (offset > 0) newFocus = getNearestEditablePositionForward(newFocus.node, newFocus.offset);

    selection.collapse(newFocus.node, newFocus.offset);
  }

  updateIdealColumn();
  updateCursorDomTracker(root);
}

function moveCursorCollapsed(config: {
  seeker: (cursor: Cursor) => SeekOutput | null;
  requireCollapseTo?: "start" | "end";
  root: HTMLElement | null;
}) {
  const { seeker, root = null, requireCollapseTo } = config;
  const cursor = getCursor();
  if (!cursor) return;

  if (!cursor.isCollapsed && requireCollapseTo !== undefined) {
    const selection = getSelection();
    if (!selection) return;

    if (requireCollapseTo === "start") {
      selection.collapseToStart();
    } else if (requireCollapseTo === "end") {
      selection.collapseToEnd();
    }
  } else {
    const newFocus = seeker(cursor);
    if (!newFocus) return;

    setCursorCollapsed(newFocus.node, newFocus.offset, root);
  }
}

/**
 * Mark all parent elements of the collapsed cursor
 */
function updateCursorDomTracker(root: HTMLElement | Document | null = document) {
  // TODO improve perf by diffing the add/remove of dataset values
  // remove all previous states
  root
    ?.querySelectorAll("[data-cursor-collapsed]")
    .forEach((container) => delete (container as HTMLElement).dataset.cursorCollapsed);

  const cursor = getCursor();
  if (cursor) {
    if (cursor.isCollapsed) {
      updateContainerStateRecursive(cursor.focus.node, root);
    }
  }
}

function updateContainerStateRecursive(currentNode: Node | null, root: Node | null) {
  if (!currentNode) {
    return;
  } else {
    if ((currentNode as HTMLElement).dataset) {
      (currentNode as HTMLElement).dataset.cursorCollapsed = "";
    }

    if (currentNode === root) return;

    updateContainerStateRecursive(currentNode.parentNode, root);
  }
}
