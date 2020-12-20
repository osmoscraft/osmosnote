export class StatusBarComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<output>Online</output>`;
  }
}

customElements.define("s2-status-bar", StatusBarComponent);
