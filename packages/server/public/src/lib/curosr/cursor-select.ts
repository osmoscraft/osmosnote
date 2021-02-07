import { seek, SeekOutput } from "../dom-utils.js";
import { getOffsetByVisualPosition, getPositionByOffset, VisualPosition } from "../line/line-query.js";
import {
  Cursor,
  getCursor,
  getDefaultCursorPosition,
  getEndPositionFromCursor,
  getHomePositionFromCursor,
  getNearestEditablePositionForward,
  getPositionAboveCursor,
  getPositionBelowCursor,
  getWordEndPositionFromCursor,
  getWordStartPositionFromCursor,
} from "./cursor-query.js";
import { updateIdealColumn } from "./ideal-column.js";

export function renderDefaultCursor(root: HTMLElement) {
  const defaultPosition = getDefaultCursorPosition();
  if (!defaultPosition) return;
  setCursorCollapsed(defaultPosition.node, defaultPosition.offset, root);
}

export function cursorRight(root: HTMLElement) {
  moveCursorCollapsedByOffset(1, root);
}

export function cursorRightSelect(root: HTMLElement) {
  extendCursorFocusByOffset(1, root);
}

export function cursorWordEnd(root: HTMLElement) {
  moveCursorCollapsed({
    seeker: getWordEndPositionFromCursor,
    requireCollapseTo: "end",
    root,
  });
}

export function cursorWordEndSelect(root: HTMLElement) {
  extendCursorFocus({ seeker: getWordEndPositionFromCursor, root });
}

export function cursorLeft(root: HTMLElement) {
  moveCursorCollapsedByOffset(-1, root);
}

export function cursorLeftSelect(root: HTMLElement) {
  extendCursorFocusByOffset(-1, root);
}

export function cursorWordStart(root: HTMLElement) {
  moveCursorCollapsed({
    seeker: getWordStartPositionFromCursor,
    requireCollapseTo: "start",
    root,
  });
}

export function cursorWordStartSelect(root: HTMLElement) {
  extendCursorFocus({ seeker: getWordStartPositionFromCursor, root });
}

export function cursorHome(root: HTMLElement) {
  moveCursorCollapsed({
    seeker: getHomePositionFromCursor,
    requireCollapseTo: "start",
    root,
  });
}

export function cursorHomeSelect(root: HTMLElement) {
  extendCursorFocus({ seeker: getHomePositionFromCursor, root });
}
export function cursorEnd(root: HTMLElement) {
  moveCursorCollapsed({
    seeker: getEndPositionFromCursor,
    requireCollapseTo: "end",
    root,
  });
}

export function cursorEndSelect(root: HTMLElement) {
  extendCursorFocus({ seeker: getEndPositionFromCursor, root });
}

export function cursorDown(root: HTMLElement) {
  moveCursorCollapsed({
    seeker: getPositionBelowCursor,
    requireCollapseTo: "end",
    root,
    rememberColumn: false,
  });
}

export function cursorDownSelect(root: HTMLElement) {
  extendCursorFocus({ seeker: getPositionBelowCursor, root, rememberColumn: false });
}

export function cursorUp(root: HTMLElement) {
  moveCursorCollapsed({
    seeker: getPositionAboveCursor,
    requireCollapseTo: "start",
    root,
    rememberColumn: false,
  });
}

export function cursorUpSelect(root: HTMLElement) {
  extendCursorFocus({ seeker: getPositionAboveCursor, root, rememberColumn: false });
}

export function setCollapsedCursorToLineOffset(config: {
  line: HTMLElement;
  offset: number;
  root?: HTMLElement | null;
  /** @default true */
  rememberColumn?: boolean;
}): SeekOutput | null {
  const { line, offset, root = null, rememberColumn = true } = config;

  const newPosition = getPositionByOffset(line, offset);
  return setCollapsedCursorToLinePosition({
    line,
    position: {
      ...newPosition,
    },
    root,
    rememberColumn,
  });
}

/**
 * Set cursor to the given row and column of the line.
 * Ignore any existing ideal position
 */
export function setCollapsedCursorToLinePosition(config: {
  line: HTMLElement;
  position: VisualPosition;
  root?: HTMLElement | null;
  /** @default true */
  rememberColumn?: boolean;
}): SeekOutput | null {
  const { line, position, root = null, rememberColumn = true } = config;

  const { row, column } = position;
  const targetOffset = getOffsetByVisualPosition(line, {
    row,
    column,
  });

  const seekOutput = seek({ source: line, offset: targetOffset });
  if (!seekOutput) {
    return null;
  }

  setCursorCollapsed(seekOutput.node, seekOutput.offset, root);

  if (rememberColumn) updateIdealColumn();
  updateCursorDomTracker(root);
  return seekOutput;
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

function extendCursorFocus(config: {
  seeker: (cursor: Cursor) => SeekOutput | null;
  root: HTMLElement | null;
  /** @default true */
  rememberColumn?: boolean;
}) {
  const { seeker, root = null, rememberColumn = true } = config;

  const cursor = getCursor();
  if (!cursor) return;
  const newFocus = seeker(cursor);
  if (!newFocus) return;

  const selection = window.getSelection()!;
  selection.setBaseAndExtent(cursor.anchor.node, cursor.anchor.offset, newFocus.node, newFocus.offset);

  if (rememberColumn) updateIdealColumn();
  updateCursorDomTracker(root);
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
  /** @default true */
  rememberColumn?: boolean;
}) {
  const { seeker, root = null, requireCollapseTo, rememberColumn = true } = config;
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

  if (rememberColumn) updateIdealColumn();
  updateCursorDomTracker(root);
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
