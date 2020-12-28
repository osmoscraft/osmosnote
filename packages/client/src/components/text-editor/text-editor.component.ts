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
  }

  private handleInput() {
    this.textAreaDom.addEventListener("input", () => {
      const displayText = this.textAreaDom.value; // Auto indentation
      this.semanticOverlay.updateContent(displayText);
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
}

customElements.define("s2-semantic-overlay", SemanticOverlayComponent);
