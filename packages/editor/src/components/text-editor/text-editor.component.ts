export class TextEditorComponent extends HTMLElement {
  private editorRoot!: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML = /*html*/ `<div id="root"></div>`;

    this.editorRoot = this.shadowRoot!.getElementById("root") as HTMLElement;
  }

  setText(text: string) {
    this.editorRoot.innerHTML = text; // TODO use compiler
  }
}
