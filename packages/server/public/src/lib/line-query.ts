import { firstInnerLeafNode, firstInnerTextNode, flattenToLeafNodes, isTextNode } from "./dom-utils.js";
import { getMeasure } from "./line-measure.js";

export function getLine(node: Node): HTMLElement | null {
  const line = node.parentElement!.closest("[data-line]") as HTMLElement | null;
  return line;
}

export interface LineMetrics {
  indent: number;
  /** Total length without any line end character */
  editableLength: number;
  /** Editable length without indent */
  wrappableLength: number;
  /** Screen width */
  measure: number;
  /** Width of the screen, excluding the physical indent on the 1st line */
  apparentMeasure: number;
  lastRowIndex: number;
  isWrapped: boolean;
}

export function getLineMetrics(line: HTMLElement): LineMetrics {
  const indent = getIndentSize(line);
  const measure = getMeasure();
  const wrappableLength = getWrappedLineLength(line);
  const editableLength = indent + wrappableLength;
  const apparentMeasure = measure - indent;
  const lastRowIndex = Math.floor(wrappableLength / apparentMeasure);
  const isWrapped = editableLength > measure;

  return {
    indent,
    editableLength,
    wrappableLength,
    measure,
    apparentMeasure,
    lastRowIndex,
    isWrapped,
  };
}

export function getLineLength(line: HTMLElement) {
  const indent = getIndentSize(line);
  const wrappedLineLength = getWrappedLineLength(line);

  return indent + wrappedLineLength;
}

export function getLineStartPosition(lineElement: HTMLElement) {
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

export interface GridPosition {
  row: number;
  column: number;
}

/**
 * Given an offset, find the row and column it belongs to, relative to that line
 * Note:
 * 1. The column may not be ediable, e.g. when line wraps, the vacumm area on left.
 * 2. If the length of the line is assumed to be infinite.
 */
export function getGridPositionByOffset(line: HTMLElement, offset: number): GridPosition {
  const { indent, apparentMeasure } = getLineMetrics(line);
  const column = ((offset - indent) % apparentMeasure) + indent;
  const row = Math.floor((offset - indent) / apparentMeasure);
  return {
    row,
    column,
  };
}

export function getNextLine(currentLine: HTMLElement): HTMLElement | null {
  return currentLine.nextElementSibling?.matches("[data-line]")
    ? (currentLine.nextElementSibling as HTMLElement)
    : null;
}

export function getPreviousLine(currentLine: HTMLElement): HTMLElement | null {
  return currentLine.previousElementSibling?.matches("[data-line]")
    ? (currentLine.previousElementSibling as HTMLElement)
    : null;
}

export function getLastRowIndexOfLine(line: HTMLElement, measure: number): number {
  const indent = getIndentSize(line);
  const wrappedLineLength = getWrappedLineLength(line);
  const lineLength = indent + wrappedLineLength;

  if (lineLength > measure) {
    // has wrap
    const apparentMeasure = measure - indent; // TODO this can be negative
    const rowIndex = Math.floor(wrappedLineLength / apparentMeasure);
    return rowIndex;
  } else {
    return 0;
  }
}

export function isAfterLineEnd(textNode: Text, offset: number) {
  return offset === textNode.length && textNode.data?.[offset - 1] === "\n";
}

function getIndentSize(line: HTMLElement): number {
  return (line.querySelector("[data-indent]") as HTMLElement)?.innerText.length ?? 0;
}

function getWrappedLineLength(line: HTMLElement): number {
  const inlineText = (line.querySelector("[data-wrap]") as HTMLElement)?.innerText;
  if (inlineText) {
    const fullLength = inlineText.length;
    return inlineText[fullLength - 1] === "\n" ? fullLength - 1 : fullLength;
  }

  return 0;
}
