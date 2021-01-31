import { firstInnerLeafNode, flattenToLeafNodes, isTextNode } from "../dom-utils.js";
import { getGridPositionByOffset, getLine, getLineStartPosition, getNextLine, isAfterLineEnd } from "../line-query.js";

/**
 * Calculate offset based on the 0-based column and row position within a wrapped line
 * When column overflows, last column on the row will be used
 * When column underflows (possible when there is a wrap), first feasible column will be used
 * When row overflows, last position of line will be used
 */
export function getOffsetInWrappedLine(input: {
  lineLength: number;
  measure: number;
  indent?: number;
  column?: number;
  row?: number;
}): number {
  const { lineLength, measure, indent = 0, column = 0, row = 0 } = input;
  const apparentLineLength = measure - indent;
  const feasibleColumn = Math.max(indent, Math.min(measure, column));
  const offset = row * apparentLineLength + feasibleColumn;
  const feasibleOffset = Math.min(lineLength, offset);

  return Math.min(feasibleOffset, offset);
}

export interface CursorLinePosition {
  offset: number;
  row: number;
  column: number;
}

export function getCursorLinePosition(cursorPosition: CursorPosition): CursorLinePosition {
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
  const { row, column } = getGridPositionByOffset(line, offset);

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
