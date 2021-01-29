import { firstInnerLeafNode, firstInnerTextNode, flattenToLeafNodes, isTextNode, seek } from "./dom-utils.js";
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
    const inlineOffset = getInlineOffset(node, offset);
    const currentLine = getLine(node)!;
    const indent = getIndentSize(currentLine);
    const measure = getMeasure();
    const wrappedInlineOffset = ((inlineOffset - indent) % (measure - indent)) + indent;
    setIdealtInlineOffset(wrappedInlineOffset);
  }
}

export function cursorDown() {
  const cursorEnd = getCursor()?.end;

  if (cursorEnd) {
    const currentLine = getLine(cursorEnd.node)!;
    const measure = getMeasure();
    const indent = getIndentSize(currentLine);
    const wrappedLineLength = getWrappedLineLength(currentLine);
    const lineLength = indent + wrappedLineLength;

    if (lineLength > measure) {
      // has wrap
      const inlineOffset = getInlineOffset(cursorEnd.node, cursorEnd.offset);
      const apparentMeasure = measure - indent; // TODO this can be negative
      const lastRowIndex = Math.floor(wrappedLineLength / apparentMeasure);
      const currentRowIndex = Math.floor((inlineOffset - indent) / apparentMeasure);

      if (inlineOffset < indent) {
        // Inside initial indent: Move to 1st wrapped line start
        const target = seek({ source: currentLine, offset: measure })!;
        setCollapsedCursor(target.node, target.offset);

        return;
      } else if (currentRowIndex < lastRowIndex) {
        // Has wrapped line below: Move to next wrapped line
        // consider consolidate with cursor up sub routines
        const targetOffset = getOffsetInWrappedLine({
          lineLength,
          measure,
          indent,
          column: getIdealInlineOffset() ?? getInlineOffset(cursorEnd.node, cursorEnd.offset),
          row: currentRowIndex + 1,
        });
        const target = seek({ source: currentLine, offset: targetOffset })!;
        setCollapsedCursor(target.node, target.offset);

        return;
      }
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
    const currentLine = getLine(cursorEnd.node)!;
    const inlineOffset = getInlineOffset(cursorEnd.node, cursorEnd.offset);
    const measure = getMeasure();

    if (inlineOffset > measure) {
      // refactor repeating logic into function setColumnOfRow()
      const indent = getIndentSize(currentLine);
      const lineLength = getLineLength(currentLine);
      const apparentMeasure = measure - indent; // TODO this can be negative
      const currentRowIndex = Math.floor((inlineOffset - indent) / apparentMeasure);
      const targetOffset = getOffsetInWrappedLine({
        lineLength,
        measure,
        indent,
        column: getIdealInlineOffset() ?? getInlineOffset(cursorEnd.node, cursorEnd.offset),
        row: currentRowIndex - 1,
      });

      const seekOuput = seek({ source: currentLine, offset: targetOffset });
      if (seekOuput) setCollapsedCursor(seekOuput.node, seekOuput.offset);

      return;
    }

    const previousLine = getPreviousLine(currentLine);

    if (!previousLine) return;

    const indent = getIndentSize(previousLine);
    const lineLength = getLineLength(previousLine);
    const lastRowIndex = getLastRowIndexOfLine(previousLine, measure);
    const targetOffset = getOffsetInWrappedLine({
      lineLength,
      measure,
      indent,
      column: getIdealInlineOffset() ?? getInlineOffset(cursorEnd.node, cursorEnd.offset),
      row: lastRowIndex,
    });

    const seekOuput = seek({ source: previousLine, offset: targetOffset });
    if (seekOuput) setCollapsedCursor(seekOuput.node, seekOuput.offset);
  }
}

function getLastRowIndexOfLine(line: HTMLElement, measure: number): number {
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

/**
 * Calculate offset based on the 0-based column and row position within a wrapped line
 * When column overflows, last column on the row will be used
 * When column underflows (possible when there is a wrap), first feasible column will be used
 * When row overflows, last position of line will be used
 */
function getOffsetInWrappedLine(input: {
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

function getSensibleOffset(line: HTMLElement, ...candidates: number[]) {
  const lineLength = getLineLength(line);

  const maxLineOffset = lineLength;
  if (maxLineOffset < 0) throw new Error("A line must have a least 1 character (including newline)");

  const result = candidates.find((candidate) => candidate < maxLineOffset);
  return result === undefined ? maxLineOffset : result;
}

function getLineLength(line: HTMLElement) {
  const indent = getIndentSize(line);
  const wrappedLineLength = getWrappedLineLength(line);

  return indent + wrappedLineLength;
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

function getWrappedLineLength(line: HTMLElement): number {
  const inlineText = (line.querySelector("[data-wrap]") as HTMLElement)?.innerText;
  if (inlineText) {
    const fullLength = inlineText.length;
    return inlineText[fullLength - 1] === "\n" ? fullLength - 1 : fullLength;
  }

  return 0;
}
