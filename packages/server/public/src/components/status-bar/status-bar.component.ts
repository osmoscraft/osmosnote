export type ChangeSatus = "new" | "clean" | "dirty";

export class StatusBarComponent extends HTMLElement {
  private messageOutputDom!: HTMLSpanElement;
  private changeStatusDom!: HTMLSpanElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<output class="stsbar-output">
    <span class="stsbar-chip stsbar-chip--change" id="change-status"></span>
    <span class="stsbar-spacer"></span>
    <span class="stsbar-chip stsbar-chip--message" id="message-output"></span>
    </output>`;
    this.messageOutputDom = this.querySelector("#message-output") as HTMLOutputElement;
    this.changeStatusDom = this.querySelector("#change-status") as HTMLOutputElement;
  }

  setChangeStatus(status: ChangeSatus) {
    this.changeStatusDom.innerText = status;
    this.changeStatusDom.dataset.status = status;
  }

  setMessage(text: string, kind: "error" | "info" | "warning" = "info") {
    this.messageOutputDom.innerText = `${text} ${new Date().toLocaleTimeString()}`;
    this.messageOutputDom.dataset.kind = kind;
  }
}
