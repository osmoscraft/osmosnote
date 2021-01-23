import { firstTextNodeOf, getTextNodeByOffset, moveToTextNode } from "./dom-utils.js";

export interface CursorElement extends HTMLSpanElement {
  dataset: {
    cursor: "start" | "end" | "collapsed";
  };
}

export function renderDefaultCursor() {
  const lines = document.querySelectorAll("[data-line]");

  if (lines.length) {
    const cursorCollapsed = document.createElement("span") as CursorElement;
    cursorCollapsed.classList.add("cursor");
    cursorCollapsed.innerText = " ";
    cursorCollapsed.dataset.cursor = "collapsed";
    lines[0].prepend(cursorCollapsed);
  }
}

export function cursorRight(root: Node) {
  const cursor = getCursor();

  if (!cursor.direction) {
    const { node, offset } = getTextNodeByOffset(cursor.end, 1, root);
    if (node !== null && offset !== null) {
      const editablePosition = getNearestEditablePosition(node, offset);
      moveToTextNode(cursor.end, editablePosition.node, editablePosition.offset);
    }
  } else {
    // TODO handle selection move
  }
}

export function cursorLeft(root: Node) {
  const cursor = getCursor();

  if (!cursor.direction) {
    const { node, offset } = getTextNodeByOffset(cursor.end, -1, root);
    if (node !== null && offset !== null) {
      moveToTextNode(cursor.end, node, offset);
    }
  } else {
    // TODO handle selection move
  }
}

export interface Cursor {
  direction: "backward" | "forward" | null;
  start: HTMLElement;
  end: HTMLElement;
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

export function getNearestEditablePosition(node: Text, offset: number) {
  if (offset === node.length && node.data?.[offset - 1] === "\n") {
    // if beyond line end
    const currentLine = node.parentElement!.closest("[data-line]")!;
    if (currentLine.nextElementSibling?.matches("[data-line]")) {
      // go to next line start
      return getLineStartPosition(currentLine.nextElementSibling! as HTMLElement);
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
  const firstLeafNode = firstTextNodeOf(lineElement);

  if (!firstLeafNode) throw new Error("Invalid line, no text node found");

  return {
    node: firstLeafNode,
    offset: 0, // TODO trim space
  };
}
