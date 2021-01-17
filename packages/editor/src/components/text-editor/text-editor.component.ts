export class TextEditorComponent extends HTMLElement {
  private editorRoot!: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML = /*html*/ `
    <style>
    #root {
      white-space: pre;
    }
    </style>
    <div id="root" contenteditable></div>
    `;

    this.editorRoot = this.shadowRoot!.getElementById("root") as HTMLElement;
  }

  setText(text: string) {
    this.editorRoot.innerHTML = text; // TODO use compiler
  }
}
