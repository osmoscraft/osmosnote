import { seek, SeekOutput } from "../dom.js";
import { getLine, getOffsetByVisualPosition, getPositionByOffset, VisualPosition } from "../line/line-query.js";
import { Cursor, getCursorFromDom } from "./cursor-query.js";
import { updateIdealColumn } from "./ideal-column.js";

export function setCollapsedCursorToLineOffset(config: {
  line: HTMLElement;
  /** @default 0 */
  offset?: number;
  root?: HTMLElement | null;
  /** @default true */
  rememberColumn?: boolean;
}): SeekOutput | null {
  const { line, offset = 0, root = null, rememberColumn = true } = config;

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
  updateCursorInDom(root);
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

  updateCursorInDom(root);
}

/**
 * Mark all parent elements of the collapsed cursor
 * @deprecated use caret service `catchUpToDom`
 */
function updateCursorInDom(root: HTMLElement | Document | null = document) {
  // TODO improve perf by diffing the add/remove of dataset values
  // remove all previous states
  clearCursorInDom(root);
  const cursor = getCursorFromDom();
  if (cursor) {
    showCursorInDom(cursor, root);
  }
}

export function clearCursorInDom(root: HTMLElement | Document | null = document) {
  root
    ?.querySelectorAll("[data-cursor-collapsed]")
    .forEach((container) => delete (container as HTMLElement).dataset.cursorCollapsed);
}

export function showCursorInDom(cursor: Cursor, root: HTMLElement | Document | null = document) {
  if (cursor.isCollapsed) {
    updateContainerStateRecursive(cursor.focus.node, root);
  }

  const line = getLine(cursor.focus.node);
  line?.scrollIntoView({ behavior: "smooth" });
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
