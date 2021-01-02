import "./menu-row.css";

export class MenuRowComponent extends HTMLElement {
  readonly dataset!: {
    kind: "header" | "option" | "message";
    commandKey: string;
    option?: "";
  };

  connectedCallback() {
    // TODO DRY this
    if (this.dataset.kind === "option") {
      this.dataset.option = "";
    }

    this.innerHTML = /*html*/ `<div class="menu-row-content">${this.innerHTML}</div>`;
  }
}
