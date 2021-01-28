import {
  firstInnerLeafNode,
  firstInnerTextNode,
  flattenToLeafNodes,
  getNodeLength,
  isTextNode,
  lastInnerLeafNode,
  seek,
} from "./dom-utils.js";
import { createState } from "./global-state.js";
import { getMeasure } from "./line-measure.js";

const [getIdealInlineOffset, setIdealtInlineOffset] = createState<null | number>(null);

export function renderDefaultCursor() {
  const lines = document.querySelectorAll("[data-line]");

  if (lines.length) {
    const range = new Range();
    const firstTextNode = firstInnerTextNode(lines[0]);
    if (firstTextNode) {
      range.setStart(firstTextNode, 0);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }
}

export function cursorRight(root: Node) {
  const cursorEnd = getCursor()?.end;
  if (!cursorEnd) return;

  const seekOuput = seek({ source: cursorEnd.node, offset: cursorEnd.offset, seek: 1, root });
  if (seekOuput) {
    const editablePosition = getNearestEditablePositionForward(seekOuput.node, seekOuput.offset);
    setCollapsedCursor(editablePosition.node, editablePosition.offset);
    updateIdealInlineOffset();
  }
}

export function cursorLeft(root: Node) {
  const cursorEnd = getCursor()?.end;
  if (!cursorEnd) return;

  const seekOuput = seek({ source: cursorEnd.node, offset: cursorEnd.offset, seek: -1, root });
  if (seekOuput) {
    setCollapsedCursor(seekOuput.node, seekOuput.offset);

    // TODO when in wrapped line, ideal inline offset needs to be apparent column
    updateIdealInlineOffset();
  }
}

function updateIdealInlineOffset() {
  const cursor = getCursor();

  if (cursor) {
    const { node, offset } = cursor.end;
    const cursorLeftEdgeIndex = getInlineOffset(node, offset);
    setIdealtInlineOffset(cursorLeftEdgeIndex);
  }
}

export function cursorDown() {
  const cursorEnd = getCursor()?.end;

  if (cursorEnd) {
    // get offset relative to line end
    const currentLine = getLine(cursorEnd.node)!;
    const inlineOffsetBackward = getInlineOffsetBackward(cursorEnd.node, cursorEnd.offset);
    const measure = getMeasure();

    if (inlineOffsetBackward > measure) {
      // TODO If total length has wrap, this condition can be false for last line
      // So instead, we should use total length of line to determine line move strategy
      // If remaining chars don't make up a whole line move, we just move to line end

      // has wrap
      const indent = getIndentSize(currentLine);
      const apparentMeasure = measure - indent; // TODO this can be negative

      // TODO handle cursor down when in indent zone
      // TODO this is inefficient.
      const inlineOffset = getInlineOffset(cursorEnd.node, cursorEnd.offset);
      const target = seek({ source: currentLine, offset: inlineOffset, seek: apparentMeasure })!;

      setCollapsedCursor(target.node, target.offset);
      return;
    }

    const nextLine = getNextLine(currentLine);
    if (!nextLine) return;

    const targetInlineOffset = getSensibleOffset(
      nextLine,
      getIdealInlineOffset() ?? getInlineOffset(cursorEnd.node, cursorEnd.offset)
    );

    const seekOuput = seek({ source: nextLine, offset: targetInlineOffset });
    if (seekOuput) setCollapsedCursor(seekOuput.node, seekOuput.offset);
  }
}

export function cursorUp() {
  const cursorEnd = getCursor()?.end;

  if (cursorEnd) {
    // get offset relative to line start
    const currentLine = getLine(cursorEnd.node)!;
    const inlineOffset = getInlineOffset(cursorEnd.node, cursorEnd.offset);
    const measure = getMeasure();

    if (inlineOffset > measure) {
      // has wrap
      const indent = getIndentSize(currentLine);
      const apparentMeasure = measure - indent; // TODO this can be negative
      const target = seek({ source: currentLine, offset: inlineOffset, seek: -apparentMeasure })!;

      setCollapsedCursor(target.node, target.offset);
      return;
    }

    const previousLine = getPreviousLine(currentLine);

    if (!previousLine) return;

    // TODO first the last instance of the desired column

    const targetInlineOffset = getSensibleOffset(
      previousLine,
      getIdealInlineOffset() ?? getInlineOffset(cursorEnd.node, cursorEnd.offset)
    );
    const seekOuput = seek({ source: previousLine, offset: targetInlineOffset });
    if (seekOuput) setCollapsedCursor(seekOuput.node, seekOuput.offset);
  }
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
  end: {
    node: Node;
    offset: number;
  };
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

function getLineStartPosition(lineElement: HTMLElement) {
  const firstLeafNode = firstInnerTextNode(lineElement);

  if (!firstLeafNode) throw new Error("Invalid line, no text node found");

  return {
    node: firstLeafNode,
    offset: 0,
  };
}

/**
 * The offset of the left edge of the node, relative to the line it's in
 */
export function getInlineOffset(node: Node, offset: number = 0): number {
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

  return inlineOffset + offset;
}

/**
 * Same as `getInlineOffset` except the reference point is the end of the line, including any whitespace character
 * The return value is the absolute distance and can never be negative
 */
export function getInlineOffsetBackward(node: Node, offset: number = 0): number {
  const line = getLine(node);
  if (!line) {
    throw new Error("Cannot get inline offset because the node is not inside a line element");
  }

  const leafNodes = flattenToLeafNodes(line);
  const measureAfterNode = lastInnerLeafNode(node)!;
  const measureAfterIndex = leafNodes.indexOf(measureAfterNode);

  if (measureAfterIndex < 0) throw new Error("Cannot locate node within the line element");

  const inlineOffset = leafNodes
    .slice(measureAfterIndex + 1)
    .reduce((length, node) => length + (isTextNode(node) ? node.length : length), 0);

  const nodeRemainingLength = getNodeLength(node) - offset;
  if (nodeRemainingLength < 0) throw new Error(`The given offset is outside of node`);

  return inlineOffset + nodeRemainingLength;
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

function getIndentSize(line: HTMLElement): number {
  return (line.querySelector("[data-indent]") as HTMLElement)?.innerText.length ?? 0;
}
