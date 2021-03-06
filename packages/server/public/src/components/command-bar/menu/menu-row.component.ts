export enum PayloadAction {
  openNoteByUrl = "open-url",
  openNoteById = "open-id",
  insertText = "insert-text",
  insertNewNoteByUrl = "insert-on-save",
}

export class MenuRowComponent extends HTMLElement {
  readonly dataset!: {
    kind: "header" | "option" | "message";
    label: string;
    /** When focused, replace args with the given value */
    autoComplete?: string;
    /** Applies to any open action */
    alwaysNewTab?: "true";
    /** Data to commit on enter */
    payload?: string;
    /** How to commit on enter */
    payloadAction?: PayloadAction;
    /** Internal only, applies to options */
    commandKey?: string;
    /** Internal only, applies to options */
    active?: "";
  };

  connectedCallback() {
    this.innerHTML = /*html*/ `<div class="menu-row-content">${this.dataset.label}</div>`;
  }
}
