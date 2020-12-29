import { HistoryService } from "../../services/history/history.service";
import { di } from "../../utils/dependency-injector";
import type { EngineModel, EngineModelCursor } from "./core/engine-model";
import { draftTextToModel } from "./core/helpers/draft-text-to-model";
import { fileTextToModel } from "./core/helpers/file-text-to-model";
import { modelToDraftText } from "./core/helpers/model-to-draft-text";
import { SemanticOverlayComponent } from "./semantic-overlay/semantic-overlay.component";
import "./text-editor.css";

/**
 * Event order (Chromium only)
 *
 * Pasting
 *   keydown > paste > input > selectionchange
 *
 * Cutting
 *   keydown > cut > beforeinput > input
 *
 * Typing
 *   keydown > beforeinput > input > selectionchange
 *
 * Arrow key
 *   keydown > selectionchange
 *
 * Drop external content
 *   beforeinput > input > selectionchange > selectionchange
 *
 * Drag and Drop selected content
 *   beforeinput > input > beforeinput > input > selectionchange > selectionchange
 */

/**
 *
 */
export class TextEditorComponent extends HTMLElement {
  textAreaDom!: HTMLTextAreaElement;
  semanticOverlay!: SemanticOverlayComponent;
  historyService!: HistoryService;
  cursor!: EngineModelCursor;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <textarea class="text-editor-shared text-editor-base" spellcheck="false" id="text-editor-base"></textarea>
    <s2-semantic-overlay class="text-editor-shared text-semantic-overlay" id="text-semantic-overlay"></s2-semantic-overlay>
    `;

    this.textAreaDom = this.querySelector("textarea")!;
    this.semanticOverlay = this.querySelector("s2-semantic-overlay") as SemanticOverlayComponent;
    this.historyService = di.createShallow(HistoryService);

    this.handlePasting();
    this.handleInput();
    this.handleScroll();
    this.handleCursor();
    this.handleUndoRedo();
  }

  loadFileText(fileText: string) {
    const model = fileTextToModel(fileText);
    this.renderModel(model);
    this.updateCursor();

    this.takeSnapshot(model);
  }

  handleDraftChange(props?: { fixFormat?: boolean }): EngineModel {
    // get model from draft
    const existingDraft = this.textAreaDom.value;
    const model = draftTextToModel(existingDraft, props?.fixFormat);

    this.renderModel(model);

    return model;
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

  // redner textarea and overlay with the model
  private renderModel(model: EngineModel) {
    const existingDraft = this.textAreaDom.value;
    const cleanDraft = modelToDraftText(model);

    if (cleanDraft !== existingDraft) {
      this.textAreaDom.value = cleanDraft;
    }

    this.semanticOverlay.updateModel(model);
  }

  private handleInput() {
    this.textAreaDom.addEventListener("keydown", (event) => {
      const existingDraft = this.textAreaDom.value;
      const currentModel = draftTextToModel(existingDraft);

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();

        const { row, col, rawStart, rawEnd } = this.cursor;

        const line = currentModel.lines[row];
        const nextLineIndentation = line.sectionLevel * 2;

        this.textAreaDom.setRangeText("\n" + " ".repeat(nextLineIndentation), rawStart, rawEnd, "end");
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        event.stopPropagation();

        const { row, col, rawStart, rawEnd } = this.cursor;

        const line = currentModel.lines[row];
        const currentLineIndentation = line.indentation;

        if (col === currentLineIndentation) {
          // TODO handle delete selection
          if (rawStart !== rawEnd) return;

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

        const { row, col, rawStart, rawEnd } = this.cursor;

        const line = currentModel.lines[row];
        const nextLine = currentModel.lines[row + 1];

        if (col === line.draftRaw.length) {
          // TODO handle delete selection
          if (rawStart !== rawEnd) return;

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

    this.textAreaDom.addEventListener("input", () => {
      this.handleDraftChange();
    });
  }

  private takeSnapshot(model: EngineModel) {
    model.cursor = this.cursor;
    this.historyService.push(JSON.stringify(model));
  }

  private restoreSnapshot(model: EngineModel) {
    this.renderModel(model);
    if (model.cursor) {
      this.textAreaDom.setSelectionRange(model.cursor.rawStart, model.cursor.rawEnd, model.cursor.direction);
    }
  }

  private handleScroll() {
    this.textAreaDom.addEventListener("scroll", () => {
      this.semanticOverlay.updateScroll(this.textAreaDom);
    });

    window.addEventListener("resize", () => {
      this.semanticOverlay.updateScroll(this.textAreaDom);
    });
  }

  private handlePasting() {
    this.textAreaDom.addEventListener("paste", (e) => {
      e.preventDefault();

      const rawText = e.clipboardData?.getData("text");
      const cleanText = rawText?.replaceAll("\r", ""); // adhere to linux convention

      // TODO consider replace tab characters \t
      const { rawStart, rawEnd } = this.cursor;
      if (cleanText) {
        this.textAreaDom.setRangeText(cleanText, rawStart, rawEnd, "end");
        const newDraft = this.textAreaDom.value;
        const newModel = draftTextToModel(newDraft);
        this.renderModel(newModel);
      }
    });
  }

  private handleCursor() {
    // TODO implement
    // TODO consolidate with history manager
    document.addEventListener("selectionchange", (e) => {
      console.log("selection change!!");
      if (document.activeElement === this.textAreaDom) {
        this.updateCursor();
        const model = this.handleDraftChange();
        this.takeSnapshot(model);
      }
    });
  }

  private updateCursor() {
    const { selectionStart, selectionEnd, selectionDirection } = this.textAreaDom;

    const draft = this.textAreaDom.value;
    const draftBefore = draft.slice(0, selectionEnd);
    const row = draftBefore.split("").filter((char) => char === "\n").length;
    const lineEndBeforeIndex = draftBefore.lastIndexOf("\n");
    const draftLineBefore = draftBefore.slice(lineEndBeforeIndex + 1);
    const col = draftLineBefore.length;

    this.cursor = {
      col,
      row,
      rawStart: selectionStart,
      rawEnd: selectionEnd,
      direction: selectionDirection,
    };
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
