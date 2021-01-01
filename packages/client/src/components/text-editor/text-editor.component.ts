import { ComponentReferenceService } from "../../services/component-reference/component-reference.service";
import { CursorSelectionService } from "../../services/cursor-selection/cursor-selection.service";
import { HistoryService } from "../../services/history/history.service";
import { sendToClipboard } from "../../utils/clipboard";
import { deepEqual } from "../../utils/deep-equal";
import { di } from "../../utils/dependency-injector";
import { emit } from "../../utils/events";
import { DEFAULT_CURSOR, EditorModel, EditorCursor } from "./model/editor-model";
import { draftTextToModelLines } from "./model/helpers/draft-text-to-model";
import { fileTextToModelLines } from "./model/helpers/file-text-to-model";
import { modelToDraftText } from "./model/helpers/model-to-draft-text";
import { modelToFileText } from "./model/helpers/model-to-file-text";
import { SyntaxOverlayComponent } from "./overlay/syntax-overlay.component";
import "./text-editor.css";

declare global {
  interface GlobalEventHandlersEventMap {
    "text-editor:model-changed": CustomEvent<EditorModel>;
  }
}

/**
 * Event pipeline (from first handled to last)
 *
 * "keydown" - ENTER/BACKSPACE/DELETE
 *     manually update textarea > (trigger "selectionchange")
 *
 * "keydown" - HOME
 *
 *     manually update selection > (trigger "selectionchange")
 * "keydown" - ARROW KEYS
 *     (trigger "selectionchange")
 *
 * TODO defer to command manager
 * "keydown" - ^z/^Z
 *     get model from snapshot > render model > update selection > (trigger "selectionchange")
 *
 * "keydown" - other
 *     (trigger "input") > (trigger "selectionchange")
 *
 * "paste"
 *     manually update textarea > (trigger "selectionchange")
 *
 * "cut"
 *     manually update textarea > (trigger "selectionchange")
 *
 * Drop external content
 *     (trigger "input") > (trigger "selectionchange")
 *
 * Drag and Drop selected content
 *     (trigger "input" - delete) > (trigger "input" - add) > (trigger "selectionchange") > (trigger "selectionchange" duplicated)
 *
 * "selectionchange"
 *     save cursor > render model > save model to snapshot
 */

/**
 *
 */
export class TextEditorComponent extends HTMLElement {
  textAreaDom!: HTMLTextAreaElement;
  semanticOverlay!: SyntaxOverlayComponent;
  historyService!: HistoryService;
  componentReferenceService!: ComponentReferenceService;
  cursorSelectionService!: CursorSelectionService;
  model!: EditorModel;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <textarea autofocus class="text-editor-shared text-editor-base" spellcheck="false" id="text-editor-base"></textarea>
    <s2-syntax-overlay class="text-editor-shared text-syntax-overlay" id="text-syntax-overlay"></s2-syntax-overlay>
    `;

    this.textAreaDom = this.querySelector("textarea")!;
    this.semanticOverlay = this.querySelector("s2-syntax-overlay") as SyntaxOverlayComponent;
    this.historyService = di.createShallow(HistoryService);
    this.componentReferenceService = di.getSingleton(ComponentReferenceService);
    this.cursorSelectionService = di.getSingleton(CursorSelectionService);
  }

  initWithText(fileText: string) {
    this.model = {
      lines: fileTextToModelLines(fileText),
      cursor: { ...DEFAULT_CURSOR },
    };

    this.saveModelToHistory();
    this.renderModel();

    // init handlers after initial render to prevent double update

    this.handlePaste();
    this.handleCut();
    this.handleKeydown();
    this.handleScroll();
    this.handleSelectionChange();
    this.handleUndoRedo();
  }

  getFileText(): string {
    return modelToFileText(this.model);
  }

  focusTextArea() {
    this.textAreaDom.focus();
  }

  handleDraftChange(props?: { fixFormat?: boolean }) {
    // get model from draft
    const existingDraft = this.textAreaDom.value;
    this.model = {
      lines: draftTextToModelLines(existingDraft, props?.fixFormat),
      cursor: this.getCursor(),
    };

    emit(this, "text-editor:model-changed", { detail: this.model });
    this.renderModel();
  }

  insertAtCursor(text: string) {
    const { rawStart, rawEnd } = this.model.cursor;
    if (text) {
      this.textAreaDom.setRangeText(text, rawStart, rawEnd, "end");
    }
  }

  undo() {
    const undoResult = this.historyService.undo();
    if (undoResult === null) {
      console.log("[text-editor] no change to undo");
    } else {
      const model: EditorModel = JSON.parse(undoResult);
      console.log("[text-editor] model after undo", model);
      this.restoreSnapshot(model);
    }
  }

  redo() {
    const redoResult = this.historyService.redo();
    if (redoResult === null) {
      console.log("[text-editor] no change to redo");
    } else {
      const model: EditorModel = JSON.parse(redoResult);
      console.log("[text-editor] model after redo", model);

      this.restoreSnapshot(model);
    }
  }

  // render textarea and overlay with the model
  private renderModel() {
    const existingDraft = this.textAreaDom.value;
    const cleanDraft = modelToDraftText(this.model);

    // render text
    if (cleanDraft !== existingDraft) {
      this.textAreaDom.value = cleanDraft;
    }

    // render cursor
    const modelCursor = this.model.cursor;
    const currentCursor = this.getCursor();
    if (
      currentCursor.rawStart !== modelCursor.rawStart ||
      currentCursor.rawEnd !== modelCursor.rawEnd ||
      currentCursor.direction !== modelCursor.direction
    ) {
      this.textAreaDom.setSelectionRange(modelCursor.rawStart, modelCursor.rawEnd, modelCursor.direction);
    }

    this.semanticOverlay.updateModel(this.model);
    this.componentReferenceService.statusBar.showCursor(modelCursor);
  }

  private handleKeydown() {
    this.textAreaDom.addEventListener("keydown", (event) => {
      const existingDraft = this.textAreaDom.value;
      const currentModel = this.model;

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();

        const cursorSelection = this.cursorSelectionService.getCurrentSelection();
        if (cursorSelection.linkId) {
          window.open(
            `/?filename=${encodeURIComponent(`${cursorSelection.linkId}.md`)}`,
            event.ctrlKey ? undefined : "_self"
          );
          return;
        }

        const { startRow: row, startCol: col, rawStart, rawEnd } = this.model.cursor;

        const line = currentModel.lines[row];
        const nextLineIndentation = line.sectionLevel * 2;

        this.textAreaDom.setRangeText("\n" + " ".repeat(nextLineIndentation), rawStart, rawEnd, "end");
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        event.stopPropagation();

        const { startRow: row, startCol: col, rawStart, rawEnd } = this.model.cursor;

        const line = currentModel.lines[row];
        const currentLineIndentation = line.indentation;

        if (rawStart !== rawEnd) {
          this.textAreaDom.setRangeText("", rawStart, rawEnd);
          return;
        }

        if (col === currentLineIndentation) {
          // delete all the indentation
          const deleteAdditional = existingDraft[rawStart - currentLineIndentation - 1] === "\n" ? 1 : 0;
          this.textAreaDom.setRangeText("", rawStart - currentLineIndentation - deleteAdditional, rawStart, "end");
        } else {
          if (rawStart > 0) {
            if (event.ctrlKey) {
              // delete back to a word begining
              const distanceToWordStart = this.distanceToWordStart(line.draftRaw, col);
              this.textAreaDom.setRangeText("", rawStart - distanceToWordStart, rawStart, "end");
            } else {
              this.textAreaDom.setRangeText("", rawStart - 1, rawStart, "end");
            }
          }
        }
      }

      if (event.key === "Delete") {
        event.preventDefault();
        event.stopPropagation();

        const { startRow: row, startCol: col, rawStart, rawEnd } = this.model.cursor;

        const line = currentModel.lines[row];
        const nextLine = currentModel.lines[row + 1];

        if (rawStart !== rawEnd) {
          this.textAreaDom.setRangeText("", rawStart, rawEnd);
          return;
        }

        if (rawEnd === this.textAreaDom.value.length) {
          return;
        }

        if (col === line.draftRaw.length) {
          const nextLineIndentation = nextLine ? nextLine.indentation : 0;

          // delete all the indentation
          this.textAreaDom.setRangeText("", rawStart, rawStart + 1 + nextLineIndentation, "start");
        } else {
          if (nextLine || col < line.draftRaw.length) {
            if (event.ctrlKey) {
              const distanceToWordEnd = this.distanceToWordEnd(line.draftRaw, col);
              this.textAreaDom.setRangeText("", rawStart, rawStart + distanceToWordEnd, "start");
            } else {
              this.textAreaDom.setRangeText("", rawStart, rawStart + 1, "start");
            }
          }
        }
      }

      if (event.key === "Home") {
        event.preventDefault();
        event.stopPropagation();

        // use where cursor ends as the reference point
        const { startRow, startCol, endRow, endCol, rawStart, rawEnd } = this.model.cursor;
        const [row, col] = rawStart < rawEnd ? [endRow, endCol] : [startRow, startCol];
        const indentation = this.model.lines[row].indentation;

        if (col <= indentation) {
          // if in padding zone, move to left edge
          const leftEdge = rawEnd - col;
          this.textAreaDom.setSelectionRange(leftEdge, leftEdge);
        } else {
          // if right to padding, move to padding end
          const leftEdgeWithPadding = rawEnd - col + indentation;
          this.textAreaDom.setSelectionRange(leftEdgeWithPadding, leftEdgeWithPadding);
        }

        // to reveal content
        this.textAreaDom.scrollLeft = 0;
      }
    });
  }

  private saveModelToHistory() {
    const historyString = this.historyService.peek();
    const modelString = JSON.stringify(this.model);

    if (historyString) {
      const historyModel = JSON.parse(historyString) as EditorModel;

      const contentChanged = !deepEqual(historyModel.lines, this.model.lines);
      const cursorChanged = !deepEqual(historyModel.cursor, this.model.cursor);

      if (contentChanged) {
        this.historyService.push(modelString);
      } else if (cursorChanged) {
        this.historyService.replace(modelString);
      }
    } else {
      this.historyService.push(modelString);
    }
  }

  private restoreSnapshot(model: EditorModel) {
    this.model = model;
    this.renderModel();
  }

  private handleScroll() {
    this.textAreaDom.addEventListener("scroll", () => {
      this.semanticOverlay.updateScroll(this.textAreaDom);
    });

    window.addEventListener("resize", () => {
      this.semanticOverlay.updateScroll(this.textAreaDom);
    });
  }

  private handleCut() {
    this.textAreaDom.addEventListener("cut", (e) => {
      e.preventDefault();

      const { rawStart, rawEnd, startRow: row } = this.model.cursor;
      const modelLines = this.model.lines;

      if (rawStart !== rawEnd) {
        const cutText = this.textAreaDom.value.slice(rawStart, rawEnd);

        sendToClipboard(cutText);
        this.textAreaDom.setRangeText("", rawStart, rawEnd, "end");
      } else {
        const draft = this.textAreaDom.value;
        const contentBefore = draft.slice(0, rawStart);
        const prevLineEnd = contentBefore.lastIndexOf("\n");

        const rawLines = modelLines.map((line) => line.draftRaw);
        const deletedLine = rawLines.splice(row, 1);
        this.textAreaDom.value = rawLines.join("\n");

        sendToClipboard(deletedLine[0]);
        this.textAreaDom.setSelectionRange(prevLineEnd + 1, prevLineEnd + 1);
      }
    });
  }

  private handlePaste() {
    this.textAreaDom.addEventListener("paste", (e) => {
      e.preventDefault();

      const rawText = e.clipboardData?.getData("text");
      const cleanText = rawText?.replaceAll("\r", ""); // adhere to linux convention

      // TODO consider replace tab characters \t
      if (cleanText) {
        this.insertAtCursor(cleanText);
      }
    });
  }

  private handleSelectionChange() {
    document.addEventListener("selectionchange", (e) => {
      if (document.activeElement === this.textAreaDom) {
        this.handleDomChange();
      }
    });
  }

  private handleDomChange() {
    this.handleDraftChange();
    this.saveModelToHistory();
  }

  private getCursor(): EditorCursor {
    const { selectionStart, selectionEnd, selectionDirection } = this.textAreaDom;

    const draft = this.textAreaDom.value;
    const { row: endRow, col: endCol } = this.getRowCol(draft, selectionEnd);
    const { row: startRow, col: startCol } = this.getRowCol(draft, selectionStart);

    return {
      startCol,
      startRow,
      endCol,
      endRow,
      rawStart: selectionStart,
      rawEnd: selectionEnd,
      direction: selectionDirection,
    };
  }

  private getRowCol(text: string, offset: number): { row: number; col: number } {
    const draftBefore = text.slice(0, offset);
    const row = draftBefore.split("").filter((char) => char === "\n").length;
    const lineEndBeforeIndex = draftBefore.lastIndexOf("\n");
    const draftLineBefore = draftBefore.slice(lineEndBeforeIndex + 1);
    const col = draftLineBefore.length;

    return { row, col };
  }

  /**
   * Start at offset and look backward, return the index of the first character of a word
   */
  private distanceToWordStart(text: string, startOffset: number): number {
    const textBeforeCurosr = text.slice(0, startOffset);
    let foundBoundary = false;
    let foundContent = false;
    let currentPosition = startOffset;

    while (!foundBoundary) {
      if (currentPosition === 0 || (foundContent && textBeforeCurosr[currentPosition - 1] === " ")) {
        foundBoundary = true;
        break;
      }

      if (textBeforeCurosr[currentPosition - 1] !== " ") {
        foundContent = true;
      }

      currentPosition--;
    }

    return startOffset - currentPosition;
  }

  /**
   * Start at offset and look forward, return the index of the last character of a word
   */
  private distanceToWordEnd(text: string, startOffset: number): number {
    let foundBoundary = false;
    let foundContent = false;
    let currentPosition = startOffset;

    while (!foundBoundary) {
      if (text[currentPosition] !== " ") {
        foundContent = true;
      }

      if (currentPosition === text.length - 1 || (foundContent && text[currentPosition + 1] === " ")) {
        foundBoundary = true;
      }

      currentPosition++;
    }

    return currentPosition - startOffset;
  }

  // TODO expose to global command for custom keybinding
  private handleUndoRedo() {
    this.textAreaDom.addEventListener("keydown", (event) => {
      if (event.ctrlKey && !event.shiftKey && event.key === "z") {
        this.undo();
        event.preventDefault();
      }

      if (event.ctrlKey && event.shiftKey && event.key === "Z") {
        this.redo();
        event.preventDefault();
      }
    });
  }
}

customElements.define("s2-syntax-overlay", SyntaxOverlayComponent);
