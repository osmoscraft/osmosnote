import "./status-bar.css";

export class StatusBarComponent extends HTMLElement {
  private outputDom!: HTMLOutputElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<output id="status-output">Online</output>`;
    this.outputDom = this.querySelector("#status-output") as HTMLOutputElement;
  }

  showText(text: string) {
    this.outputDom.innerText = `${new Date().toLocaleTimeString()} ${text}`;
  }
}

customElements.define("s2-status-bar", StatusBarComponent);
