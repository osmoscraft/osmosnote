import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import type { WindowReferenceService } from "../../services/window-reference/window.service.js";
import {
  Cursor,
  getBlockEndPositionFromCursor,
  getBlockStartPositionFromCursor,
  getDocumentEndPosition,
  getDocumentStartPosition,
  getNearestEditablePositionForward,
  getPositionAboveCursor,
  getPositionBelowCursor,
  getVisualEndPositionFromCursor,
  getVisualHomePositionFromCursor,
  getWordEndPositionFromCursor,
  getWordStartPositionFromCursor,
} from "./helpers/curosr/cursor-query.js";
import { clearCursorInDom, showCursorInDom } from "./helpers/curosr/cursor-select.js";
import { updateIdealColumn } from "./helpers/curosr/ideal-column.js";
import { seek, SeekOutput } from "./helpers/dom.js";
import { getOffsetByVisualPosition, getPositionByOffset, VisualPosition } from "./helpers/line/line-query.js";

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

  constructor(private componentRef: ComponentRefService, private windowRef: WindowReferenceService) {}

  /**
   * initialize and render cursor to default position
   */
  init(root: HTMLElement) {
    const defaultPosition = getDocumentStartPosition();
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
      seeker: getWordEndPositionFromCursor,
      requireCollapseTo: "end",
      root,
    });
  }

  selectWordEnd(root: HTMLElement) {
    this.extendCursorFocus({ seeker: getWordEndPositionFromCursor, root });
  }

  moveLeft(root: HTMLElement) {
    this.moveCursorCollapsedByOffset(-1, root);
  }

  selectLeft(root: HTMLElement) {
    this.extendCursorFocusByOffset(-1, root);
  }

  moveWordStart(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: getWordStartPositionFromCursor,
      requireCollapseTo: "start",
      root,
    });
  }

  selectWordStart(root: HTMLElement) {
    this.extendCursorFocus({ seeker: getWordStartPositionFromCursor, root });
  }

  moveHome(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: getVisualHomePositionFromCursor,
      requireCollapseTo: "start",
      root,
    });
  }

  selectHome(root: HTMLElement) {
    this.extendCursorFocus({ seeker: getVisualHomePositionFromCursor, root });
  }

  moveEnd(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: getVisualEndPositionFromCursor,
      requireCollapseTo: "end",
      root,
    });
  }

  selectEnd(root: HTMLElement) {
    this.extendCursorFocus({ seeker: getVisualEndPositionFromCursor, root });
  }

  moveBlockStart(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: getBlockStartPositionFromCursor,
      requireCollapseTo: "start",
      root,
    });
  }

  selectBlockStart(root: HTMLElement) {
    this.extendCursorFocus({ seeker: getBlockStartPositionFromCursor, root });
  }

  moveBlockEnd(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: getBlockEndPositionFromCursor,
      requireCollapseTo: "end",
      root,
    });
  }

  selectBlockEnd(root: HTMLElement) {
    this.extendCursorFocus({ seeker: getBlockEndPositionFromCursor, root });
  }

  moveDown(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: getPositionBelowCursor,
      requireCollapseTo: "end",
      root,
      rememberColumn: false,
    });
  }

  selectDown(root: HTMLElement) {
    this.extendCursorFocus({ seeker: getPositionBelowCursor, root, rememberColumn: false });
  }

  moveUp(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: getPositionAboveCursor,
      requireCollapseTo: "start",
      root,
      rememberColumn: false,
    });
  }

  selectUp(root: HTMLElement) {
    this.extendCursorFocus({ seeker: getPositionAboveCursor, root, rememberColumn: false });
  }

  selectAll(root: HTMLElement) {
    this.moveCursorCollapsed({
      seeker: getDocumentStartPosition,
      root,
    });

    this.extendCursorFocus({ seeker: getDocumentEndPosition, root });
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

    const newPosition = getPositionByOffset(line, offset);
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
    position: VisualPosition;
    root?: HTMLElement | null;
    /** @default true */
    rememberColumn?: boolean;
  }): SeekOutput | null {
    const { line, position, root = null, rememberColumn = true } = config;

    const { row, column } = position;
    const targetOffset = getOffsetByVisualPosition(line, {
      row,
      column,
    });

    const seekOutput = seek({ source: line, offset: targetOffset });
    if (!seekOutput) {
      return null;
    }

    this.setCursorCollapsed(seekOutput.node, seekOutput.offset, root);

    if (rememberColumn) updateIdealColumn();
    this.catchUpToDom();
    return seekOutput;
  }

  private updateModelFromDom() {
    const caret = this.getCursorFromDom();
    this.#caret = caret;
  }

  private renderModel() {
    const host = this.componentRef.textEditor.host;
    clearCursorInDom(host);

    if (this.#caret) {
      showCursorInDom(this.#caret, host);
    }
  }

  private getCursorFromDom(): Cursor | null {
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

      if (offset > 0) newFocus = getNearestEditablePositionForward(newFocus.node, newFocus.offset);

      selection.collapse(newFocus.node, newFocus.offset);
    }

    updateIdealColumn();
    this.catchUpToDom();
  }

  private extendCursorFocusByOffset(offset: number, root: HTMLElement | null = null) {
    const cursor = this.caret;
    if (!cursor) return;
    const { anchor, focus } = cursor;

    let newFocus = seek({ source: focus.node, offset: focus.offset, seek: offset, root });
    if (!newFocus) return;

    if (offset > 0) newFocus = getNearestEditablePositionForward(newFocus.node, newFocus.offset);

    const selection = this.windowRef.window.getSelection()!;
    selection.setBaseAndExtent(anchor.node, anchor.offset, newFocus.node, newFocus.offset);

    updateIdealColumn();
    this.catchUpToDom();
  }

  private extendCursorFocus(config: {
    seeker: (cursor: Cursor) => SeekOutput | null;
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

    if (rememberColumn) updateIdealColumn();
    this.catchUpToDom();
  }

  private moveCursorCollapsed(config: {
    seeker: (cursor: Cursor) => SeekOutput | null;
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

    if (rememberColumn) updateIdealColumn();
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
}
