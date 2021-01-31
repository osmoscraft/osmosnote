import { firstInnerLeafNode, flattenToLeafNodes, isTextNode } from "../dom-utils.js";
import {
  getPositionByOffset,
  getLine,
  getLineStartPosition,
  getNextLine,
  isAfterLineEnd,
  Position,
} from "../line-query.js";

export function getCursorLinePosition(cursorPosition: CursorPosition): Position {
  const { node, offset: cursorOffset } = cursorPosition;
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

  const offset = inlineOffset + cursorOffset;
  const { row, column } = getPositionByOffset(line, offset);

  return {
    offset,
    row,
    column,
  };
}

export interface Cursor {
  end: CursorPosition;
}

export interface CursorPosition {
  node: Node;
  offset: number;
}

export function getCursor(): Cursor | null {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;

  const range = selection.getRangeAt(0);
  const node = range.endContainer;
  const offset = range.endOffset;

  return {
    end: {
      node,
      offset,
    },
  };
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
