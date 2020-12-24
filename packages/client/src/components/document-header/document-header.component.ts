import "./document-header.css";

declare global {
  interface GlobalEventHandlersEventMap {
    // "content-host:start-modal-search": CustomEvent<never>;
  }
}

export class DocumentHeaderComponent extends HTMLElement {
  headingDom!: HTMLHeadingElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<h1 id="document-heading" class="dchdr_heading" contenteditable="true"></h1>`;
    this.headingDom = this.querySelector("#document-heading") as HTMLHeadingElement;
  }

  getTitle(): string {
    return this.headingDom.innerText;
  }

  setTitle(title: string) {
    this.headingDom.innerText = title;
  }
}

customElements.define("s2-document-header", DocumentHeaderComponent);
