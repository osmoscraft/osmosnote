import type { EditorCursor } from "../text-editor/model/editor-model";
import "./status-bar.css";

export class StatusBarComponent extends HTMLElement {
  private messageOutputDom!: HTMLSpanElement;
  private cursorStatusDom!: HTMLSpanElement;
  private changeStatusDom!: HTMLSpanElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<output class="stsbar-output">
    <span class="stsbar-chip stsbar-chip--change" id="change-status"></span>
    <span class="stsbar-spacer"></span>
    <span class="stsbar-chip stsbar-chip--status" id="cursor-status"></span>
    <span class="stsbar-chip stsbar-chip--message" id="message-output"></span>
    </output>`;
    this.messageOutputDom = this.querySelector("#message-output") as HTMLOutputElement;
    this.cursorStatusDom = this.querySelector("#cursor-status") as HTMLOutputElement;
    this.changeStatusDom = this.querySelector("#change-status") as HTMLOutputElement;
  }

  setChangeStatus(isDirty: boolean) {
    this.changeStatusDom.innerText = isDirty ? "Dirty" : "Clean";
    this.changeStatusDom.dataset.isDirty = isDirty ? "true" : "false";
  }

  setMessage(text: string, kind: "error" | "info" | "warning" = "info") {
    this.messageOutputDom.innerText = `${text} ${new Date().toLocaleTimeString()}`;
    this.messageOutputDom.dataset.kind = kind;
  }

  setCursorStatus(cursor: EditorCursor) {
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
