import {
  getLine,
  getLineStartPosition,
  getNextLine,
  isAfterLineEnd,
  Position,
  getNodeLinePosition,
} from "../line/line-query.js";

export interface Cursor {
  end: CursorPosition;
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
