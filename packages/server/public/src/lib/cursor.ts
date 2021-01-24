import {
  firstInnerLeafNode,
  firstInnerTextNode,
  flattenToLeafNodes,
  getInnerTextNode,
  getOuterTextNode,
  isTextNode,
  moveToTextNode,
} from "./dom-utils.js";
import { createState } from "./global-state.js";

export interface CursorElement extends HTMLSpanElement {
  dataset: {
    cursor: "start" | "end" | "collapsed";
    noBlink?: "";
  };
}

const [getIdealInlineOffset, setIdealtInlineOffset] = createState<null | number>(null);
const [getNoBlinkTimer, setNoBlinkTimer] = createState<null | number>(null);

export function renderDefaultCursor() {
  const lines = document.querySelectorAll("[data-line]");

  if (lines.length) {
    const cursorCollapsed = document.createElement("span") as CursorElement;
    cursorCollapsed.classList.add("cursor");
    cursorCollapsed.dataset.cursor = "collapsed";
    lines[0].prepend(cursorCollapsed);
  }
}

export function cursorRight(root: Node) {
  const cursor = getCursor();

  if (!cursor.direction) {
    const { node, offset } = getOuterTextNode(cursor.end, 1, root);
    if (node !== null && offset !== null) {
      const editablePosition = getNearestEditablePositionForward(node, offset);
      moveToTextNode(cursor.end, editablePosition.node, editablePosition.offset);
      updateIdealInlineOffset();
    }
  } else {
    // TODO handle selection move
  }

  shortPauseBlinking();
}

export function cursorLeft(root: Node) {
  const cursor = getCursor();

  if (!cursor.direction) {
    const { node, offset } = getOuterTextNode(cursor.end, -1, root);
    if (node !== null && offset !== null) {
      moveToTextNode(cursor.end, node, offset);
      updateIdealInlineOffset();
    }
  } else {
    // TODO handle selection move
  }

  shortPauseBlinking();
}

export function shortPauseBlinking() {
  const currentTimer = getNoBlinkTimer();
  if (currentTimer) {
    // already blinking
    window.clearTimeout(currentTimer);
  } else {
    const cursor = getCursor();
    if (cursor.direction === null) {
      cursor.end.dataset.noBlink = "";
      console.log("set");
    }
  }

  const newTimer = window.setTimeout(() => {
    const cursor = getCursor();
    if (cursor.direction === null) {
      delete cursor.end.dataset.noBlink;
      setNoBlinkTimer(null);
      console.log("store", null);
    }
  }, 500); // half the time of blink cycle is most natural

  setNoBlinkTimer(newTimer);
  console.log("store", newTimer);
}

function updateIdealInlineOffset() {
  const cursor = getCursor();

  if (!cursor.direction) {
    const cursorLeftEdgeIndex = getInlineOffset(cursor.end);
    console.log(cursorLeftEdgeIndex);
    setIdealtInlineOffset(cursorLeftEdgeIndex);
  } else {
    // TODO how to handle selection?
  }
}

export function cursorDown() {
  const cursor = getCursor();

  if (!cursor.direction) {
    // get offset relative to line start
    const currentLine = getLine(cursor.end)!;
    const nextLine = getNextLine(currentLine);

    if (!nextLine) return;

    const inlineOffset = getSensibleOffset(nextLine, getIdealInlineOffset() ?? getInlineOffset(cursor.end));

    const { node, offset } = getInnerTextNode(nextLine, inlineOffset);
    if (node !== null && offset !== null) {
      moveToTextNode(cursor.end, node, offset);
    }
  }

  shortPauseBlinking();
}

export function cursorUp() {
  const cursor = getCursor();

  if (!cursor.direction) {
    // get offset relative to line start
    const currentLine = getLine(cursor.end)!;
    const previousLine = getPreviousLine(currentLine);
    if (!previousLine) return;

    const inlineOffset = getSensibleOffset(previousLine, getIdealInlineOffset() ?? getInlineOffset(cursor.end));

    // get prev line
    const { node, offset } = getInnerTextNode(previousLine, inlineOffset);
    if (node !== null && offset !== null) {
      moveToTextNode(cursor.end, node, offset);
    }
  }

  shortPauseBlinking();
}

function getSensibleOffset(line: HTMLElement, ...candidates: number[]) {
  const lineLength = flattenToLeafNodes(line).reduce(
    (length, node) => length + (isTextNode(node) ? node.length : 0),
    0
  );

  const maxLineOffset = lineLength - 1;
  if (maxLineOffset < 0) throw new Error("A line must have a least 1 character (including newline)");

  const result = candidates.find((candidate) => candidate < maxLineOffset);
  return result === undefined ? maxLineOffset : result;
}

export interface Cursor {
  direction: "backward" | "forward" | null;
  start: CursorElement;
  end: CursorElement;
}

export function getCursor(): Cursor {
  const cursors = [...document.querySelectorAll(`[data-cursor]`)] as CursorElement[];
  if (cursors.length === 1) {
    return {
      direction: null,
      start: cursors[0],
      end: cursors[0],
    };
  } else if (cursors.length === 2) {
    let [start, end] = cursors;
    const isBackward = start.dataset.cursor === "end";
    if (isBackward) {
      [start, end] = [end, start];
    }

    return {
      direction: isBackward ? "backward" : "forward",
      start,
      end,
    };
  } else {
    throw new Error("Invalid cursor detected");
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

export function getLineStartPosition(lineElement: HTMLElement) {
  const firstLeafNode = firstInnerTextNode(lineElement);

  if (!firstLeafNode) throw new Error("Invalid line, no text node found");

  return {
    node: firstLeafNode,
    offset: 0, // TODO trim space
  };
}

/**
 * The offset of the left edge of the node, relative to the line it's in
 */
export function getInlineOffset(node: Node): number {
  const line = getLine(node);
  if (!line) {
    throw new Error("Cannot get inline offset because the node is not inside a line element");
  }

  const leafNodes = flattenToLeafNodes(line);
  const measureToNode = firstInnerLeafNode(node)!;
  const measureToIndex = leafNodes.indexOf(measureToNode);

  if (measureToIndex < 0) throw new Error("Cannot locate node within the line element");

  const inlineOffset = leafNodes
    .slice(0, measureToIndex)
    .reduce((length, node) => length + (isTextNode(node) ? node.length : length), 0);

  return inlineOffset;
}

function getLine(node: Node): HTMLElement | null {
  const line = node.parentElement!.closest("[data-line]") as HTMLElement | null;
  return line;
}

function getNextLine(currentLine: HTMLElement): HTMLElement | null {
  return currentLine.nextElementSibling?.matches("[data-line]")
    ? (currentLine.nextElementSibling as HTMLElement)
    : null;
}

function getPreviousLine(currentLine: HTMLElement): HTMLElement | null {
  return currentLine.previousElementSibling?.matches("[data-line]")
    ? (currentLine.previousElementSibling as HTMLElement)
    : null;
}

function isAfterLineEnd(textNode: Text, offset: number) {
  return offset === textNode.length && textNode.data?.[offset - 1] === "\n";
}
