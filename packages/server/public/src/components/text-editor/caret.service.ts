import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import type { WindowRefService } from "../../services/window-reference/window.service.js";
import { scrollIntoView } from "../../utils/scroll-into-view.js";
import { seek, SeekOutput } from "./helpers/dom.js";
import type { LineElement } from "./helpers/source-to-lines.js";
import { ensureLineEnding, getWordEndOffset, removeLineEnding, reverse } from "./helpers/string.js";
import type { LinePosition, LineQueryService, VisualLinePosition } from "./line-query.service.js";

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

export interface CaretContext {
  /** On the caret start line, all the raw text before caret, without indent */
  textBefore: string;
  /** On the caret start line, all the raw text before caret, including indent */
  textBeforeRaw: string;
  /** On the caret end line, all the raw text after caret, without line end */
  textAfter: string;
  /** On the caret end line, all the raw text after caret, including line end */
  textAfterRaw: string;
  textSelected: string;
  lineStart: LineElement;
  lineEnd: LineElement;
  lineCollapsed: LineElement | null;
}

/**
 * get, set, save, and restore the position of the caret
 */
export class CaretService {
  private _caret: Caret | null = null;
  private _idealColumn: number | null = null;

  constructor(
    private componentRef: ComponentRefService,
    private windowRef: WindowRefService,
    private lineQueryService: LineQueryService
  ) {}

  get caret() {
    return this._caret;
  }

  /**
   * initialize and render caret to default position
   */
  init(host: HTMLElement) {
    const defaultPosition = this.getDocumentStartPosition();
    if (!defaultPosition) return;

    this.setCaretCollapsed(defaultPosition.node, defaultPosition.offset, host);

    this.catchUpToDom();
  }

  isCaretInElement(element: HTMLElement) {
    const caret = this.getCaretFromDom();
    if (!caret) return false;
    return element.contains(caret.anchor.node) && element.contains(caret.focus.node);
  }

  catchUpToDom(saveColumnAsIdeal = true) {
    if (saveColumnAsIdeal) {
      this.updateIdealColumn();
    }

    const dirtyDomCaret = this.getDirtyDomCaret();
    if (dirtyDomCaret !== undefined) {
      this._caret = dirtyDomCaret;
      this.renderDomHighlightFromModel();
    }
  }

  /**
   * Set the window selection based on last saved model.
   * This will not render any highlight, but will trigger a selection change event
   */
  restoreCaretSelectionlFromModel() {
    const caret = this._caret;
    if (caret) {
      const selection = this.windowRef.window.getSelection()!;
      selection.setBaseAndExtent(caret.anchor.node, caret.anchor.offset, caret.focus.node, caret.focus.offset);
    }
  }

  moveRight(root: HTMLElement) {
    this.moveCaretCollapsedByOffset(1, root);
  }

  selectRight(root: HTMLElement) {
    this.extendFocusByOffset(1, root);
  }

  moveWordEnd(root: HTMLElement) {
    this.moveCaretCollapsed({
      seeker: this.getWordEndPositionFromCaret,
      requireCollapseTo: "end",
      root,
    });
  }

  selectWordEnd(root: HTMLElement) {
    this.extendFocus({ seeker: this.getWordEndPositionFromCaret, root });
  }

  moveLeft(root: HTMLElement) {
    this.moveCaretCollapsedByOffset(-1, root);
  }

  selectLeft(root: HTMLElement) {
    this.extendFocusByOffset(-1, root);
  }

  moveWordStart(root: HTMLElement) {
    this.moveCaretCollapsed({
      seeker: this.getWordStartPositionFromCaret,
      requireCollapseTo: "start",
      root,
    });
  }

  selectWordStart(root: HTMLElement) {
    this.extendFocus({ seeker: this.getWordStartPositionFromCaret, root });
  }

  moveHome(root: HTMLElement) {
    this.moveCaretCollapsed({
      seeker: this.getVisualHomePositionFromCaret,
      requireCollapseTo: "start",
      root,
    });
  }

  selectHome(root: HTMLElement) {
    this.extendFocus({ seeker: this.getVisualHomePositionFromCaret, root });
  }

  moveEnd(root: HTMLElement) {
    this.moveCaretCollapsed({
      seeker: this.getVisualEndPositionFromCaret,
      requireCollapseTo: "end",
      root,
    });
  }

  selectEnd(root: HTMLElement) {
    this.extendFocus({ seeker: this.getVisualEndPositionFromCaret, root });
  }

  moveBlockStart(root: HTMLElement) {
    this.moveCaretCollapsed({
      seeker: this.getBlockStartPositionFromCaret,
      requireCollapseTo: "start",
      root,
    });
  }

  selectBlockStart(root: HTMLElement) {
    this.extendFocus({ seeker: this.getBlockStartPositionFromCaret, root });
  }

  moveBlockEnd(root: HTMLElement) {
    this.moveCaretCollapsed({
      seeker: this.getBlockEndPositionFromCaret,
      requireCollapseTo: "end",
      root,
    });
  }

  selectBlockEnd(root: HTMLElement) {
    this.extendFocus({ seeker: this.getBlockEndPositionFromCaret, root });
  }

  moveDown(root: HTMLElement) {
    this.moveCaretCollapsed({
      seeker: this.getPositionBelowCaret,
      requireCollapseTo: "end",
      root,
      rememberColumn: false,
    });
  }

  selectDown(root: HTMLElement) {
    this.extendFocus({ seeker: this.getPositionBelowCaret, root, rememberColumn: false });
  }

  moveUp(root: HTMLElement) {
    this.moveCaretCollapsed({
      seeker: this.getPositionAboveCaret,
      requireCollapseTo: "start",
      root,
      rememberColumn: false,
    });
  }

  selectUp(root: HTMLElement) {
    this.extendFocus({ seeker: this.getPositionAboveCaret, root, rememberColumn: false });
  }

  selectAll(root: HTMLElement) {
    this.moveCaretCollapsed({
      seeker: this.getDocumentStartPosition,
      root,
    });

    this.extendFocus({ seeker: this.getDocumentEndPosition, root });
  }

  collapseToFocus(root: HTMLElement) {
    if (!this.caret) return;

    this.moveCaretCollapsed({
      seeker: this.getCaretFocusPosition,
      root,
    });
  }

  setCollapsedCaretToLineOffset(config: {
    line: HTMLElement;
    /** @default 0 */
    offset?: number;
    root?: HTMLElement | null;
    /** @default true */
    rememberColumn?: boolean;
  }): SeekOutput | null {
    const { line, offset = 0, root = null, rememberColumn = true } = config;

    const newPosition = this.lineQueryService.getPositionByOffset(line, offset);
    return this.setCollapsedCaretToLinePosition({
      line,
      position: {
        ...newPosition,
      },
      root,
      rememberColumn,
    });
  }

  /**
   * Set caret to the given row and column of the line.
   * Ignore any existing ideal position
   */
  setCollapsedCaretToLinePosition(config: {
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

    this.setCaretCollapsed(seekOutput.node, seekOutput.offset, root);

    this.catchUpToDom(rememberColumn);
    return seekOutput;
  }

  getCaretLinePosition(caretPosition: CaretPosition): LinePosition {
    const { node, offset } = caretPosition;
    const position = this.lineQueryService.getNodeLinePosition(node, offset);
    return position;
  }

  getCaretContext(): CaretContext | null {
    const caret = this._caret;
    if (!caret) return null;

    let textBefore,
      textSelected,
      textAfter,
      wrappableTextBefore,
      selectableTextAfter: string = "";

    const selectedLines = this.lineQueryService.getLines(caret.start.node, caret.end.node);
    const { offset: caretStartOffset } = this.getCaretLinePosition(caret.start);
    const { offset: caretEndOffset } = this.getCaretLinePosition(caret.end);

    const startLine = selectedLines[0] as LineElement;
    const { indent: startLineIndent } = this.lineQueryService.getLineMetrics(startLine);
    const startLineText = startLine.textContent!;

    const endLine = selectedLines[selectedLines.length - 1] as LineElement;
    const endLineText = endLine.textContent!;
    const distanceToEnd = endLineText.length - caretEndOffset;

    textBefore = startLineText.slice(0, caretStartOffset);
    wrappableTextBefore = startLineText.slice(startLineIndent, caretStartOffset);
    textAfter = endLineText.slice(caretEndOffset);
    selectableTextAfter = removeLineEnding(textAfter);

    textSelected = startLineText.slice(caretStartOffset);
    textSelected += selectedLines
      .slice(1)
      .map((line) => line.textContent!)
      .join("");
    textSelected = textSelected.slice(0, -distanceToEnd);

    const lineCollapsed = caret.isCollapsed ? startLine : null;

    return {
      textBeforeRaw: textBefore,
      textAfterRaw: textAfter,
      textBefore: wrappableTextBefore,
      textAfter: selectableTextAfter,
      textSelected,
      lineStart: startLine,
      lineEnd: endLine,
      lineCollapsed,
    };
  }

  private updateIdealColumn() {
    const caret = this.getCaretFromDom();

    if (caret) {
      const { column } = this.getCaretLinePosition(caret.focus);
      this._idealColumn = column;
    }
  }

  private getCaretFromDom(): Caret | null {
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
   * If already collapsed, move the caret by offset.
   * If not collapsed, collapse to the direction of movement.
   */
  private moveCaretCollapsedByOffset(offset: number, root: HTMLElement | null = null) {
    const caret = this.caret;
    if (!caret) return;
    const { focus, isCollapsed } = caret;
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

    this.catchUpToDom();
  }

  private extendFocusByOffset(offset: number, root: HTMLElement | null = null) {
    const caret = this.caret;
    if (!caret) return;
    const { anchor, focus } = caret;

    let newFocus = seek({ source: focus.node, offset: focus.offset, seek: offset, root });
    if (!newFocus) return;

    if (offset > 0) newFocus = this.getNearestEditablePositionForward(newFocus.node, newFocus.offset);

    const selection = this.windowRef.window.getSelection()!;
    selection.setBaseAndExtent(anchor.node, anchor.offset, newFocus.node, newFocus.offset);

    this.catchUpToDom();
  }

  private extendFocus(config: {
    seeker: (caret: Caret) => SeekOutput | null;
    root: HTMLElement | null;
    /** @default true */
    rememberColumn?: boolean;
  }) {
    const { seeker, root = null, rememberColumn = true } = config;

    const caret = this.caret;
    if (!caret) return;
    const newFocus = seeker.call(this, caret);
    if (!newFocus) return;

    const selection = window.getSelection()!;
    selection.setBaseAndExtent(caret.anchor.node, caret.anchor.offset, newFocus.node, newFocus.offset);

    this.catchUpToDom(rememberColumn);
  }

  private moveCaretCollapsed(config: {
    seeker: (caret: Caret) => SeekOutput | null;
    requireCollapseTo?: "start" | "end";
    root: HTMLElement | null;
    /** @default true */
    rememberColumn?: boolean;
  }) {
    const { seeker, root = null, requireCollapseTo, rememberColumn = true } = config;
    const caret = this.caret;
    if (!caret) return;

    if (!caret.isCollapsed && requireCollapseTo !== undefined) {
      const selection = getSelection();
      if (!selection) return;

      if (requireCollapseTo === "start") {
        selection.collapseToStart();
      } else if (requireCollapseTo === "end") {
        selection.collapseToEnd();
      }
    } else {
      const newFocus = seeker.call(this, caret);
      if (!newFocus) return;

      this.setCaretCollapsed(newFocus.node, newFocus.offset, root);
    }

    this.catchUpToDom(rememberColumn);
  }

  private setCaretCollapsed(node: Node, offset: number = 0, root: HTMLElement | null = null) {
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
  }

  private removeCaretHighlight(root: HTMLElement | Document | null = document) {
    root
      ?.querySelectorAll("[data-caret-collapsed]")
      .forEach((container) => delete (container as LineElement).dataset.caretCollapsed);

    root
      ?.querySelectorAll("[data-caret-selected]")
      .forEach((container) => delete (container as LineElement).dataset.caretSelected);
  }

  private addCaretHighlight(caret: Caret, root: HTMLElement | Document | null = document) {
    if (caret.isCollapsed) {
      this.updateContainerStateRecursive(caret.focus.node, root);
    }

    const selectedLines = this.lineQueryService.getLines(caret.start.node, caret.end.node) as LineElement[];
    selectedLines.forEach((line) => (line.dataset.caretSelected = ""));

    this.scrollCaretIntoView(caret);
  }

  private scrollCaretIntoView(caret: Caret) {
    const line = this.lineQueryService.getLine(caret.focus.node);
    const host = this.componentRef.textEditor.host;
    if (line) {
      scrollIntoView(line, host);
    }
  }

  private updateContainerStateRecursive(currentNode: Node | null, root: Node | null) {
    if (!currentNode) {
      return;
    } else {
      if ((currentNode as HTMLElement).dataset) {
        (currentNode as LineElement).dataset.caretCollapsed = "";
      }

      if (currentNode === root) return;

      this.updateContainerStateRecursive(currentNode.parentNode, root);
    }
  }

  private getCaretFocusPosition(caret: Caret): SeekOutput | null {
    const foundPosition = seek({ source: caret.focus.node, offset: caret.focus.offset });

    return foundPosition;
  }

  /**
   * Get the position of the next word end.
   * If the caret starts at a word end, the search will start from next character
   * If no word end found, null is returned
   */
  private getWordEndPositionFromCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);
    const { offset: caretOffset } = this.getCaretLinePosition(caret.focus);

    if (caretOffset === currentLineMetrics.selectableLength) {
      // if at line end, search next line
      const nextLine = this.lineQueryService.getNextLine(currentLine);
      if (nextLine) {
        const wordEndOffset = getWordEndOffset(nextLine.textContent!);
        const foundPosition = seek({ source: nextLine, offset: wordEndOffset })!;
        return foundPosition;
      }
    } else {
      // search current line (a result is guaranteed)
      const textAfterCaret = this.lineQueryService.sliceLine(currentLine, caretOffset);
      const wordEndOffset = getWordEndOffset(textAfterCaret);
      const foundPosition = seek({ source: currentLine, offset: caretOffset + wordEndOffset })!;
      return foundPosition;
    }

    return null;
  }

  private getWordStartPositionFromCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;
    const { offset: caretOffset } = this.getCaretLinePosition(caret.focus);

    if (caretOffset === 0) {
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
      const textBeforeCaretBackward = ensureLineEnding(
        reverse(this.lineQueryService.sliceLine(currentLine, 0, caretOffset))
      );
      const wordEndOffsetBackward = getWordEndOffset(textBeforeCaretBackward);
      const foundPosition = seek({ source: currentLine, offset: caretOffset - wordEndOffsetBackward })!;
      return foundPosition;
    }

    return null;
  }

  /**
   * If after indent, get indent end position
   * If within indent, get line start
   * If at line start, return null
   */
  private getHomePositionFromCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;
    const { offset: caretOffset } = this.getCaretLinePosition(caret.focus);
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);

    if (caretOffset > currentLineMetrics.indent) {
      // if after indent, move to indent
      return this.lineQueryService.seekToIndentEnd(currentLine);
    } else if (caretOffset > 0) {
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
  private getVisualHomePositionFromCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;
    const { offset: caretOffset, row, column } = this.getCaretLinePosition(caret.focus);
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);

    // at line start, no result
    if (caretOffset === 0) return null;

    // within first row's indent, use line start
    if (row === 0 && caretOffset <= currentLineMetrics.indent) {
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
  private getEndPositionFromCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;
    const { offset: caretOffset } = this.getCaretLinePosition(caret.focus);
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);

    if (caretOffset < currentLineMetrics.selectableLength) {
      return this.lineQueryService.seekToLineEnd(currentLine);
    } else {
      return null;
    }
  }

  /**
   * Same as getEndPosition, except when line wraps, it only moves within the current visual row
   * and when it's already at a visual row end, it will continue seeking the row below
   */
  private getVisualEndPositionFromCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;
    const { offset: caretOffset, row, column } = this.getCaretLinePosition(caret.focus);
    const currentLineMetrics = this.lineQueryService.getLineMetrics(currentLine);

    // at line end, no result
    if (caretOffset === currentLineMetrics.selectableLength) return null;

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
  private getBlockStartPositionFromCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;

    let blockStartLine = this.lineQueryService.getBlockStartLine(currentLine);

    if (blockStartLine === currentLine) {
      const caretPosition = this.getCaretLinePosition(caret.focus);
      if (caretPosition.offset === 0) {
        const previousLine = this.lineQueryService.getPreviousLine(currentLine);
        // caret is exactly at current block start. Continue search
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
  private getBlockEndPositionFromCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;

    let blockEndLine = this.lineQueryService.getBlockEndLine(currentLine);

    if (blockEndLine === currentLine) {
      const lineMetrics = this.lineQueryService.getLineMetrics(currentLine);
      const caretPosition = this.getCaretLinePosition(caret.focus);
      if (caretPosition.offset === lineMetrics.selectableLength) {
        const nextLine = this.lineQueryService.getNextLine(currentLine);
        // caret is exactly at current block end. Continue search
        if (nextLine) {
          blockEndLine = this.lineQueryService.getBlockEndLine(nextLine);
        } else {
          return null;
        }
      }
    }

    return this.lineQueryService.seekToLineEnd(blockEndLine);
  }

  private getPositionAboveCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;
    const { row: caretRow, column: caretColumn } = this.getCaretLinePosition(caret.focus);

    // wrapped line above
    if (caretRow > 0) {
      return this.getCaretSmartLinePosition(currentLine, {
        row: caretRow - 1,
        column: caretColumn,
      });
    }

    const previousLine = this.lineQueryService.getPreviousLine(currentLine);
    if (!previousLine) return null;

    // line above
    return this.getCaretSmartLinePosition(previousLine, {
      row: this.lineQueryService.getLineMetrics(previousLine).lastRowIndex,
      column: caretColumn,
    });
  }

  private getPositionBelowCaret(caret: Caret): SeekOutput | null {
    const currentLine = this.lineQueryService.getLine(caret.focus.node)!;
    const { indent, lastRowIndex, isWrapped } = this.lineQueryService.getLineMetrics(currentLine);
    const { offset: inlineOffset, row: caretRow, column: caretColumn } = this.getCaretLinePosition(caret.focus);

    if (isWrapped) {
      if (inlineOffset < indent) {
        // (inside initial indent) 1st wrapped line below
        return this.getCaretSmartLinePosition(currentLine, {
          row: caretRow + 1,
          column: indent,
        });
      } else if (caretRow < lastRowIndex) {
        // wrapped line below:
        return this.getCaretSmartLinePosition(currentLine, {
          row: caretRow + 1,
          column: caretColumn,
        });
      }
    }

    const nextLine = this.lineQueryService.getNextLine(currentLine);
    if (!nextLine) return null;

    return this.getCaretSmartLinePosition(nextLine, {
      row: 0,
      column: caretColumn,
    });
  }

  /**
   * Locate caret to the given row and column of the line.
   * Any previously saved ideal column will override the given column.
   */
  private getCaretSmartLinePosition(line: HTMLElement, fallbackPosition: VisualLinePosition): SeekOutput | null {
    const { row, column } = fallbackPosition;
    const targetOffset = this.lineQueryService.getOffsetByVisualPosition(line, {
      row,
      column: this._idealColumn ?? column,
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

  /**
   * return DOM caret if it differs from the model
   * return undefined if they are the same
   * return null if dom caret is null and differs from model
   */
  private getDirtyDomCaret(): Caret | null | undefined {
    const domCaret = this.getCaretFromDom();
    return this.compareCarets(domCaret, this._caret) ? domCaret : undefined;
  }

  private compareCarets(caretA: Caret | null, caretB: Caret | null): boolean {
    return (
      caretA?.anchor.node !== caretB?.anchor.node ||
      caretA?.anchor.offset !== caretB?.anchor.offset ||
      caretA?.focus.node !== caretB?.focus.node ||
      caretA?.focus.offset !== caretB?.focus.offset
    );
  }

  private renderDomHighlightFromModel() {
    const host = this.componentRef.textEditor.host;
    this.removeCaretHighlight(host);

    if (this._caret) {
      this.addCaretHighlight(this._caret, host);
    } else {
      this.init(host);
    }
  }

  private getDocumentStartPosition(): SeekOutput | null {
    const firstLine = document.querySelector("[data-line]") as HTMLElement;

    if (!firstLine) return null;

    return this.lineQueryService.seekToLineStart(firstLine);
  }

  private getDocumentEndPosition(): SeekOutput | null {
    const lastLine = [...document.querySelectorAll("[data-line]")].pop() as HTMLElement;

    if (!lastLine) return null;

    return this.lineQueryService.seekToLineEnd(lastLine);
  }
}
