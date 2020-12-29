import type { EditorCursor } from "../text-editor/model/editor-model";
import "./status-bar.css";

export class StatusBarComponent extends HTMLElement {
  private messageOutputDom!: HTMLSpanElement;
  private cursorStatusDom!: HTMLSpanElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<output>
      <span id="cursor-status"></span>
      <span id="message-output"></span>
    </output>`;
    this.messageOutputDom = this.querySelector("#message-output") as HTMLOutputElement;
    this.cursorStatusDom = this.querySelector("#cursor-status") as HTMLOutputElement;
  }

  showText(text: string) {
    this.messageOutputDom.innerText = `${new Date().toLocaleTimeString()} ${text}`;
  }

  showCursor(cursor: EditorCursor) {
    if (cursor.rawStart === cursor.rawEnd) {
      this.cursorStatusDom.innerText = `${cursor.startRow}:${cursor.startCol}`;
    } else if (cursor.direction === "backward") {
      this.cursorStatusDom.innerText = `${cursor.startRow}:${cursor.startCol}←${cursor.endRow}:${cursor.endCol}`;
    } else {
      this.cursorStatusDom.innerText = `${cursor.startRow}:${cursor.startCol}→${cursor.endRow}:${cursor.endCol}`;
    }
  }
}
