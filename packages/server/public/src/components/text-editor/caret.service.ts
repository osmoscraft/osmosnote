import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import type { WindowRefService } from "../../services/window-reference/window.service.js";
import { seek, SeekOutput } from "./helpers/dom.js";
import { ensureLineEnding, getWordEndOffset, reverse } from "./helpers/string.js";
import type { LineQueryService, LinePosition, VisualLinePosition } from "./line-query.service.js";

export interface Caret {
  anchor: CaretPosition;
  focus: CaretPosition;
  start: CaretPosition;
  end: CaretPosition;
  isCollapsed: boolean;
}

export interface CaretPosition {
  node: Node;
  offset: number;
}

/**
 * get, set, save, and restore the position of the caret
 */
export class CaretService {
  get caret() {
    // const cachedCaret = this.#caret;
    // return cachedCaret;

    // TODO, no need to query dom once all mutation are managed by this class
    // TODO, make sure we update model whenever mutating curosr
    return this.getCursorFromDom();
  }

  #caret: Caret | null = null;

  #idealColumn: number | null = null;

  constructor(
    private componentRef: ComponentRefService,
    private windowRef: WindowRefService,
    private lineQueryService: LineQueryService
  ) {
    this.getWordEndPositionFromCursor = this.getWordEndPositionFromCursor.bind(this);
    this.getWordStartPositionFromCursor = this.getWordStartPositionFromCursor.bind(this);
    this.getVisualHomePositionFromCursor = this.getVisualHomePositionFromCursor.bind(this);
    this.getVisualEndPositionFromCursor = this.getVisualEndPositionFromCursor.bind(this);
    this.getBlockStartPositionFromCursor = this.getBlockStartPositionFromCursor.bind(this);
    this.getBlockEndPositionFromCursor = this.getBlockEndPositionFromCursor.bind(this);
    this.getPositionBelowCursor = this.getPositionBelowCursor.bind(this);
    this.getPositionAboveCursor = this.getPositionAboveCursor.bind(this);
  }

  /**
   * initialize and render cursor to default position
   */
  init(root: HTMLElement) {
    const defaultPosition = this.lineQueryService.getDocumentStartPosition();
    if (!defaultPosition) return;
    this.setCursorCollapsed(defaultPosition.node, defaultPosition.offset, root);
  }

  catchUpToDom() {
    this.updateModelFromDom();
    this.renderModel();
  }

  moveRight(root: HTMLElement) {
    this.moveCursorCollapsedByOffset(1, root);
  }

  selectRight(root: HTMLElement) {
    this.extendCursorFocusByOffset(1, root);
  }

  moveWordEnd(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: this.getWordEndPositionFromCursor,
      requireCollapseTo: "end",
      root,
    });
  }

  selectWordEnd(root: HTMLElement) {
    this.extendCursorFocus({ seeker: this.getWordEndPositionFromCursor, root });
  }

  moveLeft(root: HTMLElement) {
    this.moveCursorCollapsedByOffset(-1, root);
  }

  selectLeft(root: HTMLElement) {
    this.extendCursorFocusByOffset(-1, root);
  }

  moveWordStart(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: this.getWordStartPositionFromCursor,
      requireCollapseTo: "start",
      root,
    });
  }

  selectWordStart(root: HTMLElement) {
    this.extendCursorFocus({ seeker: this.getWordStartPositionFromCursor, root });
  }

  moveHome(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: this.getVisualHomePositionFromCursor,
      requireCollapseTo: "start",
      root,
    });
  }

  selectHome(root: HTMLElement) {
    this.extendCursorFocus({ seeker: this.getVisualHomePositionFromCursor, root });
  }

  moveEnd(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: this.getVisualEndPositionFromCursor,
      requireCollapseTo: "end",
      root,
    });
  }

  selectEnd(root: HTMLElement) {
    this.extendCursorFocus({ seeker: this.getVisualEndPositionFromCursor, root });
  }

  moveBlockStart(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: this.getBlockStartPositionFromCursor,
      requireCollapseTo: "start",
      root,
    });
  }

  selectBlockStart(root: HTMLElement) {
    this.extendCursorFocus({ seeker: this.getBlockStartPositionFromCursor, root });
  }

  moveBlockEnd(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: this.getBlockEndPositionFromCursor,
      requireCollapseTo: "end",
      root,
    });
  }

  selectBlockEnd(root: HTMLElement) {
    this.extendCursorFocus({ seeker: this.getBlockEndPositionFromCursor, root });
  }

  moveDown(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: this.getPositionBelowCursor,
      requireCollapseTo: "end",
      root,
      rememberColumn: false,
    });
  }

  selectDown(root: HTMLElement) {
    this.extendCursorFocus({ seeker: this.getPositionBelowCursor, root, rememberColumn: false });
  }

  moveUp(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: this.getPositionAboveCursor,
      requireCollapseTo: "start",
      root,
      rememberColumn: false,
    });
  }

  selectUp(root: HTMLElement) {
    this.extendCursorFocus({ seeker: this.getPositionAboveCursor, root, rememberColumn: false });
  }

  selectAll(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: this.lineQueryService.getDocumentStartPosition,
      root,
    });

    this.extendCursorFocus({ seeker: this.lineQueryService.getDocumentEndPosition, root });
  }

  setCollapsedCursorToLineOffset(config: {
    line: HTMLElement;
    /** @default 0 */
    offset?: number;
    root?: HTMLElement | null;
    /** @default true */
    rememberColumn?: boolean;
  }): SeekOutput | null {
    const { line, offset = 0, root = null, rememberColumn = true } = config;

    const newPosition = this.lineQueryService.getPositionByOffset(line, offset);
    return this.setCollapsedCursorToLinePosition({
      line,
      position: {
        ...newPosition,
      },
      root,
      rememberColumn,
    });
  }

  /**
   * Set cursor to the given row and column of the line.
   * Ignore any existing ideal position
   */
  setCollapsedCursorToLinePosition(config: {
    line: HTMLElement;
    position: VisualLinePosition;
    root?: HTMLElement | null;
    /** @default true */
    rememberColumn?: boolean;
  }): SeekOutput | null {
    const { line, position, root = null, rememberColumn = true } = config;

    const { row, column } = position;
    const targetOffset = this.lineQueryService.getOffsetByVisualPosition(line, {
      row,
      column,
    });

    const seekOutput = seek({ source: line, offset: targetOffset });
    if (!seekOutput) {
      return null;
    }

    this.setCursorCollapsed(seekOutput.node, seekOutput.offset, root);

    if (rememberColumn) this.updateIdealColumn();
    this.catchUpToDom();
    return seekOutput;
  }

  getCursorLinePosition(cursorPosition: CaretPosition): LinePosition {
    const { node, offset } = cursorPosition;
    const position = this.lineQueryService.getNodeLinePosition(node, offset);
    return position;
  }

  private updateModelFromDom() {
    const caret = this.getCursorFromDom();
    this.#caret = caret;
  }

  private renderModel() {
    const host = this.componentRef.textEditor.host;
    this.clearCursorInDom(host);

    if (this.#caret) {
      this.showCursorInDom(this.#caret, host);
    }
  }

  private updateIdealColumn() {
    const cursor = this.caret;

    if (cursor) {
      const { column } = this.getCursorLinePosition(cursor.focus);
      this.#idealColumn = column;
    }
  }

  private getCursorFromDom(): Caret | null {
    const selection = this.windowRef.window.getSelection();
    if (!selection) return null;

    const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
    if (!anchorNode || !focusNode) return null;

    if (!selection.rangeCount) return null;
    const range = selection.getRangeAt(0);

    return {
      anchor: {
        node: anchorNode,
        offset: anchorOffset,
      },
      focus: {
        node: focusNode,
        offset: focusOffset,
      },
      start: {
        node: range.startContainer,
        offset: range.startOffset,
      },
      end: {
        node: range.endContainer,
        offset: range.endOffset,
      },
      isCollapsed: selection.isCollapsed,
    };
  }

  /**
   * If already collapsed, move the cursor by offset.
   * If not collapsed, collapse to the direction of movement.
   */
  private moveCursorCollapsedByOffset(offset: number, root: HTMLElement | null = null) {
    const cursor = this.caret;
    if (!cursor) return;
    const { focus, isCollapsed } = cursor;
    const selection = this.windowRef.window.getSelection()!;
    if (!selection) return;

    if (!isCollapsed) {
      if (offset > 0) {
        selection.collapseToEnd();
      } else {
        selection.collapseToStart();
      }
    } else {
      let newFocus = seek({ source: focus.node, offset: focus.offset, seek: offset, root });
      if (!newFocus) return;

      if (offset > 0) newFocus = this.getNearestEditablePositionForward(newFocus.node, newFocus.offset);

      selection.collapse(newFocus.node, newFocus.offset);
    }

    this.updateIdealColumn();
    this.catchUpToDom();
  }

  private extendCursorFocusByOffset(offset: number, root: HTMLElement | null = null) {
    const cursor = this.caret;
    if (!cursor) return;
    const { anchor, focus } = cursor;

    let newFocus = seek({ source: focus.node, offset: focus.offset, seek: offset, root });
    if (!newFocus) return;

    if (offset > 0) newFocus = this.getNearestEditablePositionForward(newFocus.node, newFocus.offset);

    const selection = this.windowRef.window.getSelection()!;
    selection.setBaseAndExtent(anchor.node, anchor.offset, newFocus.node, newFocus.offset);

    this.updateIdealColumn();
    this.catchUpToDom();
  }

  private extendCursorFocus(config: {
    seeker: (cursor: Caret) => SeekOutput | null;
    root: HTMLElement | null;
    /** @default true */
    rememberColumn?: boolean;
  }) {
    const { seeker, root = null, rememberColumn = true } = config;

    const cursor = this.caret;
    if (!cursor) return;
    const newFocus = seeker(cursor);
    if (!newFocus) return;

    const selection = window.getSelection()!;
    selection.setBaseAndExtent(cursor.anchor.node, cursor.anchor.offset, newFocus.node, newFocus.offset);

    if (rememberColumn) this.updateIdealColumn();
    this.catchUpToDom();
  }

  private moveCursorCollapsed(config: {
    seeker: (cursor: Caret) => SeekOutput | null;
    requireCollapseTo?: "start" | "end";
    root: HTMLElement | null;
    /** @default true */
    rememberColumn?: boolean;
  }) {
    const { seeker, root = null, requireCollapseTo, rememberColumn = true } = config;
    const cursor = this.caret;
    if (!cursor) return;

    if (!cursor.isCollapsed && requireCollapseTo !== undefined) {
      const selection = getSelection();
      if (!selection) return;

      if (requireCollapseTo === "start") {
        selection.collapseToStart();
      } else if (requireCollapseTo === "end") {
        selection.collapseToEnd();
      }
    } else {
      const newFocus = seeker(cursor);
      if (!newFocus) return;

      this.setCursorCollapsed(newFocus.node, newFocus.offset, root);
    }

    if (rememberColumn) this.updateIdealColumn();
    this.catchUpToDom();
  }

  private setCursorCollapsed(node: Node, offset: number = 0, root: HTMLElement | null = null) {
    const selection = this.windowRef.window.getSelection();

    if (selection) {
      if (selection.rangeCount) {
        selection.removeAllRanges();
      }

      const range = new Range();
      range.setEnd(node, offset);
      range.collapse();

      selection.addRange(range);
    }

    this.catchUpToDom();
  }

  private clearCursorInDom(root: HTMLElement | Document | null = document) {
    root
      ?.querySelectorAll("[data-cursor-collapsed]")
      .forEach((container) => delete (container as HTMLElement).dataset.cursorCollapsed);
  }

  private showCursorInDom(cursor: Caret, root: HTMLElement | Document | null = document) {
    if (cursor.isCollapsed) {
      this.updateContainerStateRecursive(cursor.focus.node, root);
    }

    const line = this.lineQueryService.getLine(cursor.focus.node);
    line?.scrollIntoView({ behavior: "smooth" });
  }

  private updateContainerStateRecursive(currentNode: Node | null, root: Node | null) {
    if (!currentNode) {
      return;
    } else {
      if ((currentNode as HTMLElement).dataset) {
        (currentNode as HTMLElement).dataset.cursorCollapsed = "";
      }

      if (currentNode === root) return;

      this.updateContainerStateRecursive(currentNode.parentNode, root);
    }
  }

  /**
   * Get the position of the next word end.
   * If the cursor starts at a word end, the search will start from next character
   * If no word end found, null is returned
   */
  private getWordEndPositionFromCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);
    const { offset: cursorOffset } = this.getCursorLinePosition(cursor.focus);

    if (cursorOffset === currentLineMetrics.selectableLength) {
      // if at line end, search next line
      const nextLine = this.lineQueryService.getNextLine(currentLine);
      if (nextLine) {
        const wordEndOffset = getWordEndOffset(nextLine.textContent!);
        const foundPosition = seek({ source: nextLine, offset: wordEndOffset })!;
        return foundPosition;
      }
    } else {
      // search current line (a result is guaranteed)
      const textAfterCursor = this.lineQueryService.sliceLine(currentLine, cursorOffset);
      const wordEndOffset = getWordEndOffset(textAfterCursor);
      const foundPosition = seek({ source: currentLine, offset: cursorOffset + wordEndOffset })!;
      return foundPosition;
    }

    return null;
  }

  private getWordStartPositionFromCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;
    const { offset: cursorOffset } = this.getCursorLinePosition(cursor.focus);

    if (cursorOffset === 0) {
      // if at line start, search previous line
      const previousLine = this.lineQueryService.getPreviousLine(currentLine);
      if (previousLine) {
        const previousLineBackward = this.lineQueryService.getReversedLine(previousLine);
        const wordEndOffsetBackward = getWordEndOffset(previousLineBackward);
        const previousLineMetrics = this.lineQueryService.getLineMetrics(previousLine);
        const wordEndOffset = previousLineMetrics.selectableLength - wordEndOffsetBackward;
        const foundPosition = seek({ source: previousLine, offset: wordEndOffset })!;
        return foundPosition;
      }
    } else {
      // search current line (a result is guaranteed)
      const textBeforeCursorBackward = ensureLineEnding(
        reverse(this.lineQueryService.sliceLine(currentLine, 0, cursorOffset))
      );
      const wordEndOffsetBackward = getWordEndOffset(textBeforeCursorBackward);
      const foundPosition = seek({ source: currentLine, offset: cursorOffset - wordEndOffsetBackward })!;
      return foundPosition;
    }

    return null;
  }

  /**
   * If after indent, get indent end position
   * If within indent, get line start
   * If at line start, return null
   */
  private getHomePositionFromCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;
    const { offset: cursorOffset } = this.getCursorLinePosition(cursor.focus);
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);

    if (cursorOffset > currentLineMetrics.indent) {
      // if after indent, move to indent
      return this.lineQueryService.seekToIndentEnd(currentLine);
    } else if (cursorOffset > 0) {
      // if within indent, move to line start
      return this.lineQueryService.seekToLineStart(currentLine);
    } else {
      return null;
    }
  }

  /**
   * Same as getHomePosition, except when line wraps, it only moves within the current visual row
   * and when it's already at a visual row start, it will continue seeking the row above
   */
  private getVisualHomePositionFromCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;
    const { offset: cursorOffset, row, column } = this.getCursorLinePosition(cursor.focus);
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);

    // at line start, no result
    if (cursorOffset === 0) return null;

    // within first row's indent, use line start
    if (row === 0 && cursorOffset <= currentLineMetrics.indent) {
      return this.lineQueryService.seekToLineStart(currentLine);
    }

    // at a wrapped row's beginning, use row above
    if (row > 0 && column <= currentLineMetrics.indent) {
      const offset = this.lineQueryService.getOffsetByVisualPosition(currentLine, {
        row: row - 1,
        column: currentLineMetrics.indent,
      });
      return seek({ source: currentLine, offset });
    }

    // within the content on some row, use the column where visual indent ends
    const offset = this.lineQueryService.getOffsetByVisualPosition(currentLine, {
      row,
      column: currentLineMetrics.indent,
    });
    return seek({ source: currentLine, offset });
  }

  /**
   * If before line end, get line end
   * If at line end, return null
   */
  private getEndPositionFromCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;
    const { offset: cursorOffset } = this.getCursorLinePosition(cursor.focus);
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);

    if (cursorOffset < currentLineMetrics.selectableLength) {
      return this.lineQueryService.seekToLineEnd(currentLine);
    } else {
      return null;
    }
  }

  /**
   * Same as getEndPosition, except when line wraps, it only moves within the current visual row
   * and when it's already at a visual row end, it will continue seeking the row below
   */
  private getVisualEndPositionFromCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;
    const { offset: cursorOffset, row, column } = this.getCursorLinePosition(cursor.focus);
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);

    // at line end, no result
    if (cursorOffset === currentLineMetrics.selectableLength) return null;

    // within the content on some row, go to last column (ok to overflow)
    const offset = this.lineQueryService.getOffsetByVisualPosition(currentLine, {
      row,
      column: currentLineMetrics.measure,
    });
    return seek({ source: currentLine, offset });
  }

  /**
   * Get the nearest non-empty line start above that's after an emptying line or page start
   */
  private getBlockStartPositionFromCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;

    let blockStartLine = this.lineQueryService.getBlockStartLine(currentLine);

    if (blockStartLine === currentLine) {
      const cursorPosition = this.getCursorLinePosition(cursor.focus);
      if (cursorPosition.offset === 0) {
        const previousLine = this.lineQueryService.getPreviousLine(currentLine);
        // cursor is exactly at current block start. Continue search
        if (previousLine) {
          blockStartLine = this.lineQueryService.getBlockStartLine(previousLine);
        } else {
          return null;
        }
      }
    }

    return this.lineQueryService.seekToLineStart(blockStartLine);
  }

  /**
   * Get the nearest non-empty line end below that's before an emptying line or page end
   */
  private getBlockEndPositionFromCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;

    let blockEndLine = this.lineQueryService.getBlockEndLine(currentLine);

    if (blockEndLine === currentLine) {
      const lineMetrics = this.lineQueryService.getLineMetrics(currentLine);
      const cursorPosition = this.getCursorLinePosition(cursor.focus);
      if (cursorPosition.offset === lineMetrics.selectableLength) {
        const nextLine = this.lineQueryService.getNextLine(currentLine);
        // cursor is exactly at current block end. Continue search
        if (nextLine) {
          blockEndLine = this.lineQueryService.getBlockEndLine(nextLine);
        } else {
          return null;
        }
      }
    }

    return this.lineQueryService.seekToLineEnd(blockEndLine);
  }

  private getPositionAboveCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;
    const { row: cursorRow, column: cursorColumn } = this.getCursorLinePosition(cursor.focus);

    // wrapped line above
    if (cursorRow > 0) {
      return this.getCursorSmartLinePosition(currentLine, {
        row: cursorRow - 1,
        column: cursorColumn,
      });
    }

    const previousLine = this.lineQueryService.getPreviousLine(currentLine);
    if (!previousLine) return null;

    // line above
    return this.getCursorSmartLinePosition(previousLine, {
      row: this.lineQueryService.getLineMetrics(previousLine).lastRowIndex,
      column: cursorColumn,
    });
  }

  private getPositionBelowCursor(cursor: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(cursor.focus.node)!;
    const { indent, lastRowIndex, isWrapped } = this.lineQueryService.getLineMetrics(currentLine);
    const { offset: inlineOffset, row: cursorRow, column: cursorColumn } = this.getCursorLinePosition(cursor.focus);

    if (isWrapped) {
      if (inlineOffset < indent) {
        // (inside initial indent) 1st wrapped line below
        return this.getCursorSmartLinePosition(currentLine, {
          row: cursorRow + 1,
          column: indent,
        });
      } else if (cursorRow < lastRowIndex) {
        // wrapped line below:
        return this.getCursorSmartLinePosition(currentLine, {
          row: cursorRow + 1,
          column: cursorColumn,
        });
      }
    }

    const nextLine = this.lineQueryService.getNextLine(currentLine);
    if (!nextLine) return null;

    return this.getCursorSmartLinePosition(nextLine, {
      row: 0,
      column: cursorColumn,
    });
  }

  /**
   * Locate cursor to the given row and column of the line.
   * Any previously saved ideal column will override the given column.
   */
  private getCursorSmartLinePosition(line: HTMLElement, fallbackPosition: VisualLinePosition): SeekOutput | null {
    const { row, column } = fallbackPosition;
    const targetOffset = this.lineQueryService.getOffsetByVisualPosition(line, {
      row,
      column: this.#idealColumn ?? column,
    });

    const newFocus = seek({ source: line, offset: targetOffset });
    return newFocus;
  }

  private getNearestEditablePositionForward(node: Text, offset: number) {
    if (this.lineQueryService.isAfterLineEnd(node, offset)) {
      // if beyond line end
      const currentLine = this.lineQueryService.getLine(node)!;
      const nextLine = this.lineQueryService.getNextLine(currentLine);
      if (nextLine) {
        // go to next line start
        return this.lineQueryService.seekToLineStart(nextLine);
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
}
