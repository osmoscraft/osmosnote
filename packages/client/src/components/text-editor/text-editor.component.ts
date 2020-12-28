import { HistoryService } from "../../services/history/history.service";
import { di } from "../../utils/dependency-injector";
import type { SemanticModel } from "./core/core";
import { draftTextToModel } from "./core/draft-text-to-model";
import { fileTextToModel } from "./core/file-text-to-model";
import { modelToDraftText } from "./core/model-to-draft-text";
import { SemanticOverlayComponent } from "./semantic-overlay/semantic-overlay.component";
import "./text-editor.css";

export class TextEditorComponent extends HTMLElement {
  textAreaDom!: HTMLTextAreaElement;
  semanticOverlay!: SemanticOverlayComponent;
  historyService!: HistoryService;

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
    this.handleModelChange(model);
    this.historyService.push(JSON.stringify(model));
  }

  format() {
    const existingDraft = this.textAreaDom.value;
    const model = draftTextToModel(existingDraft, true);

    this.handleModelChange(model);
    this.historyService.push(JSON.stringify(model));
  }

  undo() {
    const undoResult = this.historyService.undo();
    if (undoResult !== null) {
      const model: SemanticModel = JSON.parse(undoResult);
      this.handleModelChange(model);
    }
  }

  redo() {
    const redoResult = this.historyService.redo();
    if (redoResult !== null) {
      const model: SemanticModel = JSON.parse(redoResult);
      this.handleModelChange(model);
    }
  }

  private handleModelChange(model: SemanticModel) {
    const existingDraft = this.textAreaDom.value;
    const cleanDraft = modelToDraftText(model);

    if (cleanDraft !== existingDraft) {
      const { selectionStart, selectionEnd, selectionDirection } = this.textAreaDom;
      this.textAreaDom.value = cleanDraft;
      // TODO (prevText, newText, prevSelection) => newSelection
      this.autoAlignCursor({ selectionStart, selectionEnd, selectionDirection });
    }

    this.semanticOverlay.updateModel(model);
  }

  private debugSelection() {
    const { selectionStart, selectionEnd, selectionDirection } = this.textAreaDom;
    // console.log({ selectionStart, selectionEnd, selectionDirection });
  }

  private handleInput() {
    this.textAreaDom.addEventListener("input", () => {
      const existingDraft = this.textAreaDom.value;
      const model = draftTextToModel(existingDraft);

      this.handleModelChange(model);
      this.historyService.push(JSON.stringify(model));
    });
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

      document.execCommand("insertText", false, cleanText);
    });
  }

  private handleCursor() {
    interface SemanticCursor {
      row: number;
      column: number;
    }

    // TODO implement
    // TODO consolidate with history manager
    document.addEventListener("selectionchange", (e) => {
      if (document.activeElement === this.textAreaDom) {
        // console.log(this.textAreaDom.selectionStart);
        this.debugSelection();
      }
    });
  }

  // TODO consolidate this into core engine
  private autoAlignCursor(previousSelection: {
    selectionStart: number;
    selectionEnd: number;
    selectionDirection: string;
  }) {
    const draftText = this.textAreaDom.value;
    // naively, align to end of line
    for (let i = previousSelection.selectionStart; i < draftText.length; i++) {
      if (draftText[i] === "\n") {
        this.textAreaDom.setSelectionRange(i, i);
        return;
      }
    }
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
