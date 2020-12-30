import "./document-header.css";

declare global {
  interface GlobalEventHandlersEventMap {
    // "content-host:start-modal-search": CustomEvent<never>;
  }
}

export class DocumentHeaderComponent extends HTMLElement {
  headingDom!: HTMLHeadingElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<h1 id="document-heading" class="dchdr-heading" contenteditable="true"></h1>`;
    this.headingDom = this.querySelector("#document-heading") as HTMLHeadingElement;
  }

  getTitle(): string {
    return this.headingDom.innerText;
  }

  setTitle(title: string) {
    this.headingDom.innerText = title;
  }
}
