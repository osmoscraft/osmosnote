import "./text-editor.css";
import { TextEditorService } from "./text-editor.service";

export class TextEditorComponent extends HTMLElement {
  private editorRoot!: HTMLElement;
  private textEditorService: TextEditorService = new TextEditorService();

  connectedCallback() {
    this.innerHTML = /*html*/ `

    <div id="root" class="txte-content-host" contenteditable></div>
    `;

    this.editorRoot = this.querySelector("#root") as HTMLElement;

    this.editorRoot.addEventListener("click", (e) => {
      console.log("click", e);
    });

    this.editorRoot.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
      }
    });

    document.addEventListener("selectionchange", (e) => {
      const selObj = window.getSelection();
      let targetNode = selObj?.anchorNode;
      if (targetNode && targetNode.nodeType === Node.TEXT_NODE) {
        targetNode = targetNode.parentNode;
      }

      if (targetNode) {
        const refElement = (targetNode as HTMLElement).closest<HTMLElement>("[data-path]");
        if (refElement) {
          const path = refElement.dataset.path as string;
          const offset = selObj!.anchorOffset; // assume no shifting between target element and ref element.
          this.textEditorService.handleClick(path, offset);
        }
      }
    });
  }

  setText(text: string) {
    this.textEditorService.initWithText(text);

    this.editorRoot.innerHTML = this.textEditorService.getHtml();
  }
}
