import { astToHtml, parse } from "@system-two/compiler";

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
    const ast = parse(text);
    console.log(ast);
    const html = astToHtml(ast);

    this.editorRoot.innerHTML = html; // TODO use compiler
  }
}
