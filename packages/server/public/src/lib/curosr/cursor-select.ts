import { firstInnerTextNode, seek } from "../dom-utils.js";
import { getMeasure } from "../line-measure.js";
import {
  getInlineOffset,
  getLastRowIndexOfLine,
  getLine,
  getLineLength,
  getLineMetrics,
  getNextLine,
  getPreviousLine,
} from "../line-query.js";
import {
  getCursor,
  getCursorLinePosition as getCursorLinePosition,
  getNearestEditablePositionForward,
  getOffsetInWrappedLine,
} from "./cursor-query.js";
import { updateIdealColumn, getIdealColumn } from "./ideal-column.js";

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
    updateIdealColumn();
  }
}

export function cursorLeft(root: Node) {
  const cursorEnd = getCursor()?.end;
  if (!cursorEnd) return;

  const seekOuput = seek({ source: cursorEnd.node, offset: cursorEnd.offset, seek: -1, root });
  if (seekOuput) {
    setCollapsedCursor(seekOuput.node, seekOuput.offset);

    // TODO when in wrapped line, ideal inline offset needs to be apparent column
    updateIdealColumn();
  }
}

export function cursorDown() {
  const cursorEnd = getCursor()?.end;

  if (cursorEnd) {
    const currentLine = getLine(cursorEnd.node)!;
    const measure = getMeasure();
    const { indent, editableLength, lastRowIndex, isWrapped } = getLineMetrics(currentLine);

    if (isWrapped) {
      const { offset: inlineOffset, row: cursorRow, column: cursorColumn } = getCursorLinePosition(cursorEnd);

      if (inlineOffset < indent) {
        // Inside initial indent: Move to 1st wrapped line start
        const target = seek({ source: currentLine, offset: measure })!;
        setCollapsedCursor(target.node, target.offset);

        return;
      } else if (cursorRow < lastRowIndex) {
        // Has wrapped line below: Move to next wrapped line
        // consider consolidate with cursor up sub routines
        const targetOffset = getOffsetInWrappedLine({
          lineLength: editableLength,
          measure,
          indent,
          column: getIdealColumn() ?? cursorColumn,
          row: cursorRow + 1,
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
      getIdealColumn() ?? getInlineOffset(cursorEnd.node, cursorEnd.offset)
    );

    const seekOuput = seek({ source: nextLine, offset: targetInlineOffset });
    if (seekOuput) setCollapsedCursor(seekOuput.node, seekOuput.offset);
  }
}

export function cursorUp() {
  const cursorEnd = getCursor()?.end;

  if (cursorEnd) {
    const currentLine = getLine(cursorEnd.node)!;
    const { row: cursorRow, column: cursorColumn } = getCursorLinePosition(cursorEnd);
    const { indent: currentIndent, measure, editableLength: currentLength } = getLineMetrics(currentLine);

    if (cursorRow > 0) {
      const targetOffset = getOffsetInWrappedLine({
        lineLength: currentLength,
        measure,
        indent: currentIndent,
        column: getIdealColumn() ?? cursorColumn,
        row: cursorRow - 1,
      });

      const seekOuput = seek({ source: currentLine, offset: targetOffset });
      if (seekOuput) setCollapsedCursor(seekOuput.node, seekOuput.offset);

      return;
    }

    const previousLine = getPreviousLine(currentLine);

    if (!previousLine) return;

    const { indent: previousIndent, editableLength: previousLength, lastRowIndex } = getLineMetrics(previousLine);
    const targetOffset = getOffsetInWrappedLine({
      lineLength: previousLength,
      measure,
      indent: previousIndent,
      column: getIdealColumn() ?? cursorColumn,
      row: lastRowIndex,
    });

    const seekOuput = seek({ source: previousLine, offset: targetOffset });
    if (seekOuput) setCollapsedCursor(seekOuput.node, seekOuput.offset);
  }
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

function getSensibleOffset(line: HTMLElement, ...candidates: number[]) {
  const lineLength = getLineLength(line);

  const maxLineOffset = lineLength;
  if (maxLineOffset < 0) throw new Error("A line must have a least 1 character (including newline)");

  const result = candidates.find((candidate) => candidate < maxLineOffset);
  return result === undefined ? maxLineOffset : result;
}
