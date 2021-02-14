import {
  firstInnerLeafNode,
  firstInnerTextNode,
  flattenToLeafNodes,
  isTextNode,
  seek,
  SeekOutput,
} from "../dom-utils.js";
import { FormatContext, FormattedLineElement, isIndentSettingLine, isIndentSettingLineType } from "../parse.js";
import type { LineElement } from "../source-to-lines.js";
import { ensureLineEnding, removeLineEnding, reverse } from "../string.js";
import { getMeasure } from "./line-measure.js";

export function getLine(node: Node): HTMLElement | null {
  const line = node.parentElement!.closest("[data-line]") as HTMLElement | null;
  return line;
}

export function getLines(startNode: Node, endNode: Node): HTMLElement[] {
  const startLine = getLine(startNode);
  const endLine = getLine(endNode);
  if (!startLine || !endLine) return [];

  const results = [startLine];
  let currentLine: HTMLElement = startLine;
  while (currentLine !== endLine) {
    const nextLine = getNextLine(currentLine);
    if (nextLine) {
      currentLine = nextLine;
    } else {
      console.error("the end node is not a sibling after the start node");
      break;
    }
    results.push(currentLine);
  }

  return results;
}

export function getPortableText(lines: HTMLElement[], startLineOffset = 0, endLineOffset?: number): string {
  const text = lines
    .map((line, index) => {
      const metrics = getLineMetrics(line);
      const startOffset = index === 0 ? Math.max(metrics.indent, startLineOffset) : metrics.indent;
      const endOffset = index === lines.length - 1 ? endLineOffset : undefined;

      return line.textContent!.slice(startOffset, endOffset);
    })
    .join("");

  return text;
}

export interface LineMetrics {
  indent: number;
  /** Total length without any line end character */
  selectableLength: number;
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
  // This can be 0 whne line is empty, because new line character is not counted
  const wrappableLength = getWrappableLineLength(line);
  const selectableLength = indent + wrappableLength;
  const apparentMeasure = measure - indent;
  const lineCount = Math.ceil(wrappableLength / apparentMeasure);
  // when lineCount is 0, use 0 as row index
  const lastRowIndex = Math.max(0, lineCount - 1);
  const isWrapped = selectableLength > measure;

  return {
    indent,
    selectableLength: selectableLength,
    wrappableLength,
    measure,
    apparentMeasure,
    lastRowIndex,
    isWrapped,
  };
}

export function getLineLength(line: HTMLElement) {
  const indent = getIndentSize(line);
  const wrappedLineLength = getWrappableLineLength(line);

  return indent + wrappedLineLength;
}

export function seekToLineStart(lineElement: HTMLElement): SeekOutput {
  const firstLeafNode = firstInnerTextNode(lineElement);

  if (!firstLeafNode) throw new Error("Invalid line, no text node found");

  return {
    node: firstLeafNode,
    offset: 0,
  };
}

export function seekToIndentEnd(lineElement: HTMLElement): SeekOutput {
  const lineMetrics = getLineMetrics(lineElement);

  return seek({ source: lineElement, seek: lineMetrics.indent })!;
}

export function seekToLineEnd(lineElement: HTMLElement): SeekOutput {
  const lineMetrics = getLineMetrics(lineElement);

  return seek({ source: lineElement, seek: lineMetrics.selectableLength })!;
}

export function getBlockStartLine(lineElement: HTMLElement, isInBlock = false): HTMLElement {
  let candidateLine = lineElement;
  if ((candidateLine as LineElement).dataset.line !== "blank") {
    isInBlock = true;
  }
  let previousLine = getPreviousLine(candidateLine) as LineElement | null;

  if (isInBlock && previousLine?.dataset.line === "blank") return candidateLine;

  if (!previousLine) return candidateLine;

  return getBlockStartLine(previousLine, isInBlock);
}
export function getBlockEndLine(lineElement: HTMLElement, isInBlock = false): HTMLElement {
  let candidateLine = lineElement;
  if ((candidateLine as LineElement).dataset.line !== "blank") {
    isInBlock = true;
  }

  let nextLine = getNextLine(candidateLine) as LineElement | null;

  if (isInBlock && nextLine?.dataset.line === "blank") return candidateLine;

  if (!nextLine) return candidateLine;

  return getBlockEndLine(nextLine, isInBlock);
}

/**
 * Position of a node relative to the line that contains it
 */
export function getNodeLinePosition(node: Node, offsetFromNode: number = 0): Position {
  const line = getLine(node);
  if (!line) {
    throw new Error("Cannot get line position because the node is not inside a line element");
  }

  const leafNodes = flattenToLeafNodes(line);
  const measureToNode = firstInnerLeafNode(node)!;
  const measureToIndex = leafNodes.indexOf(measureToNode);

  if (measureToIndex < 0) throw new Error("Cannot locate node within the line element");

  const inlineOffset = leafNodes
    .slice(0, measureToIndex)
    .reduce((length, node) => length + (isTextNode(node) ? node.length : 0), 0);

  const offsetFromLine = inlineOffset + offsetFromNode;
  const { row, column } = getPositionByOffset(line, offsetFromLine);

  return {
    offset: offsetFromLine,
    row,
    column,
  };
}

export interface Position extends VisualPosition, LinearPosition {}

export interface VisualPosition {
  row: number;
  column: number;
}

export interface LinearPosition {
  offset: number;
}

/**
 * Given an offset, find the row and column it belongs to, relative to that line
 * Note:
 * 1. The column may not be ediable, e.g. when line wraps, the vacumm area on left.
 * 2. If the length of the line is assumed to be infinite.
 */
export function getPositionByOffset(line: HTMLElement, offset: number): Position {
  const { indent, apparentMeasure } = getLineMetrics(line);

  if (offset < indent) {
    return {
      offset,
      row: 0,
      column: offset,
    };
  } else {
    const column = ((offset - indent) % apparentMeasure) + indent;
    const row = Math.floor((offset - indent) / apparentMeasure);
    return {
      offset,
      row,
      column,
    };
  }
}

/**
 * Given column and row of a line, get the offset from the start of the line
 * Note:
 * 1. When column overflows, last column on the row will be used
 * 2. When column underflows (possible when there is a wrap), first feasible column will be used
 * 3. When row overflows, last position of line will be used
 */
export function getOffsetByVisualPosition(line: HTMLElement, visualPosition: VisualPosition): number {
  const { column, row } = visualPosition;
  const { indent, measure, apparentMeasure, selectableLength: editableLength } = getLineMetrics(line);
  const feasibleColumn = Math.max(row > 0 ? indent : 0, Math.min(measure, column)); // only 1st row can use the indent
  const offset = row * apparentMeasure + feasibleColumn;
  const feasibleOffset = Math.min(editableLength, offset);

  return Math.min(feasibleOffset, offset);
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
  const wrappedLineLength = getWrappableLineLength(line);
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

export function sliceLine(line: HTMLElement, start?: number, end?: number): string {
  const rawText = line.textContent ?? "";
  return rawText.slice(start, end);
}

export function getReversedLine(line: HTMLElement): string {
  return ensureLineEnding(reverse(removeLineEnding(line.textContent!)));
}

export function getFormatContext(line: HTMLElement): FormatContext {
  const indentSettingLine = getNearestIndentSettingLine(line);
  if (indentSettingLine) {
    return {
      level: parseInt(indentSettingLine.dataset.level),
      isLevelDirty: indentSettingLine.dataset.dirtyIndent === "",
    };
  }

  return {
    level: 0,
    isLevelDirty: false,
  };
}

function getNearestIndentSettingLine(line: HTMLElement): FormattedLineElement | null {
  let currentLine: HTMLElement | null = line;
  while (currentLine) {
    if (isIndentSettingLine(currentLine)) {
      return currentLine;
    }

    currentLine = getPreviousLine(currentLine);
  }

  return null;
}

function getIndentSize(line: HTMLElement): number {
  return (line.querySelector("[data-indent]") as HTMLElement)?.innerText.length ?? 0;
}

function getWrappableLineLength(line: HTMLElement): number {
  const inlineText = (line.querySelector("[data-wrap]") as HTMLElement)?.innerText;
  if (inlineText) {
    const fullLength = inlineText.length;
    return inlineText[fullLength - 1] === "\n" ? fullLength - 1 : fullLength;
  }

  return 0;
}
