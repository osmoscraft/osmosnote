import { di } from "../../utils/dependency-injector.js";
import { TextEditorService } from "./text-editor.service.js";

export class TextEditorComponent extends HTMLElement {
  private textEditorService!: TextEditorService;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <div id="content-host" spellcheck="false" contenteditable="true"></div>`;

    this.textEditorService = di.createShallow(TextEditorService);
    this.textEditorService.init();
  }
}
