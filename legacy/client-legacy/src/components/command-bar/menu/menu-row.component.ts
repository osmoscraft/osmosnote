import "./menu-row.css";

export class MenuRowComponent extends HTMLElement {
  readonly dataset!: {
    kind: "header" | "option" | "message";
    commandKey?: string;

    label: string;
    active?: "";
    /**
     * When focused, replace args with the given value
     */
    autoComplete?: string;
    openUrl?: string;
    alwaysNewTab?: "true";
    openNoteById?: string;
    insertText?: string;
    insertOnSave?: string;
  };

  connectedCallback() {
    this.innerHTML = /*html*/ `<div class="menu-row-content">${this.dataset.label}</div>`;
  }
}
