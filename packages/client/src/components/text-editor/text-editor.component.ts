import { ComponentReferenceService } from "../../services/component-reference/component-reference.service";
import { CursorSelectionService } from "../../services/cursor-selection/cursor-selection.service";
import { HistoryService } from "../../services/history/history.service";
import { di } from "../../utils/dependency-injector";
import { emit } from "../../utils/events";
import { DEFAULT_CURSOR, EngineModel, EngineModelCursor } from "./core/engine-model";
import { draftTextToModelLines } from "./core/helpers/draft-text-to-model";
import { fileTextToModelLines } from "./core/helpers/file-text-to-model";
import { modelToDraftText } from "./core/helpers/model-to-draft-text";
import { SemanticOverlayComponent } from "./semantic-overlay/semantic-overlay.component";
import "./text-editor.css";

declare global {
  interface GlobalEventHandlersEventMap {
    "text-editor:model-changed": CustomEvent<EngineModel>;
  }
}

/**
 * Event pipeline (from first handled to last)
 *
 * "keydown" - ENTER/BACKSPACE/DELETE
 *     manually update textarea > (trigger "selectionchange")
 *
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
  semanticOverlay!: SemanticOverlayComponent;
  historyService!: HistoryService;
  componentReferenceService!: ComponentReferenceService;
  cursorSelectionService!: CursorSelectionService;
  model!: EngineModel;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <textarea class="text-editor-shared text-editor-base" spellcheck="false" id="text-editor-base"></textarea>
    <s2-semantic-overlay class="text-editor-shared text-semantic-overlay" id="text-semantic-overlay"></s2-semantic-overlay>
    `;

    this.textAreaDom = this.querySelector("textarea")!;
    this.semanticOverlay = this.querySelector("s2-semantic-overlay") as SemanticOverlayComponent;
    this.historyService = di.createShallow(HistoryService);
    this.componentReferenceService = di.getSingleton(ComponentReferenceService);
    this.cursorSelectionService = di.getSingleton(CursorSelectionService);

    this.handlePaste();
    this.handleCut();
    this.handleInput();
    this.handleScroll();
    this.handleSelectionChange();
    this.handleUndoRedo();
  }

  loadFileText(fileText: string) {
    this.model = {
      lines: fileTextToModelLines(fileText),
      cursor: { ...DEFAULT_CURSOR },
    };
    this.renderModel();

    this.takeSnapshot();
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

  undo() {
    const undoResult = this.historyService.undo();
    if (undoResult !== null) {
      const model: EngineModel = JSON.parse(undoResult);
      console.log(model);
      this.restoreSnapshot(model);
    }
  }

  redo() {
    const redoResult = this.historyService.redo();
    if (redoResult !== null) {
      const model: EngineModel = JSON.parse(redoResult);
      console.log(model);

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
      currentCursor.rawStart !== modelCursor.rawStart &&
      currentCursor.rawEnd !== modelCursor.rawEnd &&
      currentCursor.direction !== modelCursor.direction
    ) {
      this.textAreaDom.setSelectionRange(modelCursor.rawStart, modelCursor.rawEnd, modelCursor.direction);
    }

    this.semanticOverlay.updateModel(this.model);
    this.componentReferenceService.statusBar.showCursor(modelCursor);
  }

  private handleInput() {
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
            this.textAreaDom.setRangeText("", rawStart - 1, rawStart, "end");
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

        if (col === line.draftRaw.length) {
          const nextLineIndentation = nextLine ? nextLine.indentation : 0;

          // delete all the indentation
          this.textAreaDom.setRangeText("", rawStart, rawStart + 1 + nextLineIndentation, "end");
        } else {
          if (nextLine || col < line.draftRaw.length) {
            this.textAreaDom.setRangeText("", rawStart, rawStart + 1, "end");
          }
        }
      }
    });
  }

  private takeSnapshot() {
    this.historyService.push(JSON.stringify(this.model));
  }

  private restoreSnapshot(model: EngineModel) {
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

      if (rawStart !== rawEnd) {
        const cutText = this.textAreaDom.value.slice(rawStart, rawEnd);

        try {
          navigator.clipboard.writeText(cutText);
          this.textAreaDom.setRangeText("", rawStart, rawEnd, "end");
        } catch (error) {
          console.log("clipboard permission denied");
        }
      } else {
        const draft = this.textAreaDom.value;
        const contentBefore = draft.slice(0, rawStart);
        const prevLineEnd = contentBefore.lastIndexOf("\n");

        const rawLines = draft.split("\n");
        rawLines.splice(row, 1);
        this.textAreaDom.value = rawLines.join("\n");
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
      const { rawStart, rawEnd } = this.model.cursor;
      if (cleanText) {
        this.textAreaDom.setRangeText(cleanText, rawStart, rawEnd, "end");
      }
    });
  }

  private handleSelectionChange() {
    // TODO consolidate with history manager
    document.addEventListener("selectionchange", (e) => {
      if (document.activeElement === this.textAreaDom) {
        this.handleDraftChange();
        this.takeSnapshot();
      }
    });
  }

  private getCursor(): EngineModelCursor {
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

  // TODO expose to global command for custom keybinding
  private handleUndoRedo() {
    this.textAreaDom.addEventListener("keydown", (event) => {
      if (event.ctrlKey && !event.shiftKey && event.key === "z") {
        this.undo();
        event.preventDefault();
        console.log("[text-editor] undo");
      }

      if (event.ctrlKey && event.shiftKey && event.key === "Z") {
        this.redo();
        event.preventDefault();
        console.log("[text-editor] redo");
      }
    });
  }
}

customElements.define("s2-semantic-overlay", SemanticOverlayComponent);
