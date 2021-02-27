import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import type { WindowReferenceService } from "../../services/window-reference/window.service.js";
import {
  Cursor,
  getBlockEndPositionFromCursor,
  getBlockStartPositionFromCursor,
  getDocumentEndPosition,
  getDocumentStartPosition,
  getPositionAboveCursor,
  getPositionBelowCursor,
  getVisualEndPositionFromCursor,
  getVisualHomePositionFromCursor,
  getWordEndPositionFromCursor,
  getWordStartPositionFromCursor,
} from "./helpers/curosr/cursor-query.js";
import {
  clearCursorInDom,
  extendCursorFocus,
  extendCursorFocusByOffset,
  moveCursorCollapsed,
  moveCursorCollapsedByOffset,
  showCursorInDom,
} from "./helpers/curosr/cursor-select.js";

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

  catchUpToDom() {
    this.updateModelFromDom();
    this.renderModel();
  }

  moveRight(root: HTMLElement) {
    moveCursorCollapsedByOffset(1, root);
  }

  selectRight(root: HTMLElement) {
    extendCursorFocusByOffset(1, root);
  }

  moveWordEnd(root: HTMLElement) {
    moveCursorCollapsed({
      seeker: getWordEndPositionFromCursor,
      requireCollapseTo: "end",
      root,
    });
  }

  selectWordEnd(root: HTMLElement) {
    extendCursorFocus({ seeker: getWordEndPositionFromCursor, root });
  }

  moveLeft(root: HTMLElement) {
    moveCursorCollapsedByOffset(-1, root);
  }

  selectLeft(root: HTMLElement) {
    extendCursorFocusByOffset(-1, root);
  }

  moveWordStart(root: HTMLElement) {
    moveCursorCollapsed({
      seeker: getWordStartPositionFromCursor,
      requireCollapseTo: "start",
      root,
    });
  }

  selectWordStart(root: HTMLElement) {
    extendCursorFocus({ seeker: getWordStartPositionFromCursor, root });
  }

  moveHome(root: HTMLElement) {
    moveCursorCollapsed({
      seeker: getVisualHomePositionFromCursor,
      requireCollapseTo: "start",
      root,
    });
  }

  selectHome(root: HTMLElement) {
    extendCursorFocus({ seeker: getVisualHomePositionFromCursor, root });
  }

  moveEnd(root: HTMLElement) {
    moveCursorCollapsed({
      seeker: getVisualEndPositionFromCursor,
      requireCollapseTo: "end",
      root,
    });
  }

  selectEnd(root: HTMLElement) {
    extendCursorFocus({ seeker: getVisualEndPositionFromCursor, root });
  }

  moveBlockStart(root: HTMLElement) {
    moveCursorCollapsed({
      seeker: getBlockStartPositionFromCursor,
      requireCollapseTo: "start",
      root,
    });
  }

  selectBlockStart(root: HTMLElement) {
    extendCursorFocus({ seeker: getBlockStartPositionFromCursor, root });
  }

  moveBlockEnd(root: HTMLElement) {
    moveCursorCollapsed({
      seeker: getBlockEndPositionFromCursor,
      requireCollapseTo: "end",
      root,
    });
  }

  selectBlockEnd(root: HTMLElement) {
    extendCursorFocus({ seeker: getBlockEndPositionFromCursor, root });
  }

  moveDown(root: HTMLElement) {
    moveCursorCollapsed({
      seeker: getPositionBelowCursor,
      requireCollapseTo: "end",
      root,
      rememberColumn: false,
    });
  }

  selectDown(root: HTMLElement) {
    extendCursorFocus({ seeker: getPositionBelowCursor, root, rememberColumn: false });
  }

  moveUp(root: HTMLElement) {
    moveCursorCollapsed({
      seeker: getPositionAboveCursor,
      requireCollapseTo: "start",
      root,
      rememberColumn: false,
    });
  }

  selectUp(root: HTMLElement) {
    extendCursorFocus({ seeker: getPositionAboveCursor, root, rememberColumn: false });
  }

  selectAll(root: HTMLElement) {
    moveCursorCollapsed({
      seeker: getDocumentStartPosition,
      root,
    });

    extendCursorFocus({ seeker: getDocumentEndPosition, root });
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
}
