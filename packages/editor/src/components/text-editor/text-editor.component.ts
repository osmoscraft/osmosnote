import "./text-editor.css";
import { TextEditorService } from "./text-editor.service";

export class TextEditorComponent extends HTMLElement {
  private editorRoot!: HTMLElement;
  private textEditorService: TextEditorService = new TextEditorService();

  constructor() {
    super();

    this.textEditorService.handleEvents({
      onUpdate: () => {
        this.renderModel();
      },
    });
  }

  connectedCallback() {
    this.innerHTML = /*html*/ `

    <div id="root" class="txte-content-host" contenteditable></div>
    `;

    this.editorRoot = this.querySelector("#root") as HTMLElement;

    this.editorRoot.addEventListener("click", (e) => {});

    this.editorRoot.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          this.textEditorService.cursorRight();
          break;
        case "ArrowLeft":
          e.preventDefault();
          this.textEditorService.cursorLeft();
          break;
      }

      // handle literal insert (ASCII only)
      // ref: https://stackoverflow.com/questions/1247762/regex-for-all-printable-characters
      // TODO handle CJKT, and other unicode (such as emoji)
      if (e.key && !e.altKey && !e.ctrlKey) {
        if (e.key.match(/^[ -~]$/)) {
          e.preventDefault();
          this.textEditorService.insertAtCursor(e.key);
        }
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

  loadText(text: string) {
    this.textEditorService.setText(text);
    this.textEditorService.resetCursor();

    this.editorRoot.innerHTML = this.textEditorService.getHtml();
  }

  private renderModel() {
    this.renderModelContent();
    this.renderModelCursor();
  }

  private renderModelContent() {
    this.editorRoot.innerHTML = this.textEditorService.getHtml();
  }

  private renderModelCursor() {
    const cursorDetails = this.textEditorService.getCursorDetails();

    if (cursorDetails) {
      const selector = `[data-path="${cursorDetails.pathToNode}"]`;
      const domNode = this.editorRoot.querySelector(selector);
      if (domNode) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          const range = document.createRange();
          range.setStart(domNode.childNodes[0], cursorDetails.offsetToNode);
          sel.addRange(range);
        }
      }
    }
  }
}
