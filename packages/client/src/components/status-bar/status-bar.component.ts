import type { EditorCursor } from "../text-editor/model/editor-model";
import "./status-bar.css";

export class StatusBarComponent extends HTMLElement {
  private messageOutputDom!: HTMLSpanElement;
  private cursorStatusDom!: HTMLSpanElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<output class="stsbar-output">
    <span class="stsbar-message" id="message-output"></span>
    <span class="stsbar-spacer"></span>
    <span class="stsbar-cursor" id="cursor-status"></span>
    </output>`;
    this.messageOutputDom = this.querySelector("#message-output") as HTMLOutputElement;
    this.cursorStatusDom = this.querySelector("#cursor-status") as HTMLOutputElement;
  }

  showText(text: string) {
    this.messageOutputDom.innerText = `${new Date().toLocaleTimeString()} ${text}`;
  }

  showCursor(cursor: EditorCursor) {
    const selectionSize = cursor.rawEnd - cursor.rawStart;

    if (!selectionSize) {
      this.cursorStatusDom.innerText = `${cursor.startRow}:${cursor.startCol}`;
    } else if (cursor.direction === "backward") {
      this.cursorStatusDom.innerText = `${cursor.startRow}:${cursor.startCol}🡠${cursor.endRow}:${cursor.endCol} (${selectionSize})`;
    } else if (cursor.direction === "forward") {
      this.cursorStatusDom.innerText = `${cursor.startRow}:${cursor.startCol}🡢${cursor.endRow}:${cursor.endCol} (${selectionSize})`;
    } else {
      this.cursorStatusDom.innerText = `${cursor.startRow}:${cursor.startCol}-${cursor.endRow}:${cursor.endCol} (${selectionSize})`;
    }
  }
}
