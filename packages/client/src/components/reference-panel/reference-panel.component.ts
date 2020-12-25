import "./reference-panel.css";

export class ReferencePanelComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = /*html*/ `<aside>References</aside>`;
  }
}

customElements.define("s2-reference-panel", ReferencePanelComponent);
