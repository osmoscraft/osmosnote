import { draftTextToModel } from "./core/draft-text-to-model";
import { fileTextToModel } from "./core/file-text-to-model";
import { modelToDraftText } from "./core/model-to-draft-text";
import { SemanticOverlayComponent } from "./semantic-overlay/semantic-overlay.component";
import "./text-editor.css";

export class TextEditorComponent extends HTMLElement {
  textAreaDom!: HTMLTextAreaElement;
  semanticOverlay!: SemanticOverlayComponent;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <textarea class="text-editor-shared text-editor-base" spellcheck="false" id="text-editor-base"></textarea>
    <s2-semantic-overlay class="text-editor-shared text-semantic-overlay" id="text-semantic-overlay"></s2-semantic-overlay>
    `;

    this.textAreaDom = this.querySelector("textarea")!;
    this.semanticOverlay = this.querySelector("s2-semantic-overlay") as SemanticOverlayComponent;

    this.handlePasting();
    this.handleInput();
    this.handleScroll();
    this.handleCursor();
  }

  loadFileText(fileText: string) {
    const model = fileTextToModel(fileText);
    this.textAreaDom.value = modelToDraftText(model);

    this.semanticOverlay.updateModel(model);
  }

  private handleInput() {
    this.textAreaDom.addEventListener("input", () => {
      const dirtyDraft = this.textAreaDom.value;
      const model = draftTextToModel(dirtyDraft);
      const cleanDraft = modelToDraftText(model);

      if (cleanDraft !== dirtyDraft) {
        this.textAreaDom.value = cleanDraft;
      }

      this.semanticOverlay.updateModel(model);
      console.log(model);
    });
  }

  private handleScroll() {
    this.textAreaDom.addEventListener("scroll", () => {
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
  }
}

customElements.define("s2-semantic-overlay", SemanticOverlayComponent);
