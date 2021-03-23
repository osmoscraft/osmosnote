export enum PayloadAction {
  openNoteByUrl = "open-url",
  openNoteById = "open-id",
  insertText = "insert-text",
  /** Open a new note with provided url. Insert a link to the new note from current note when the new note is saved. */
  insertNewNoteByUrl = "insert-on-save-url",
  linkToNoteById = "link-to-id",
  /** Open a new note with provided url. Convert selection to a link to the new note when the new note is saved. */
  linkToNewNoteByUrl = "link-on-save-url",
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
    /** Comma separate list of tags */
    tags?: string;
  };

  connectedCallback() {
    const tagsHTML = this.dataset?.tags?.length
      ? /*html*/ `<ul class="menu-row-content--tags tag-list">
    ${this.dataset.tags
      .split(",")
      .map((tag: string) => `<li class="tag-item">${tag}</li>`)
      .join("")}
    </ul>`
      : "";

    this.innerHTML = /*html*/ `<div class="menu-row-content">
    <span class="menu-row-content--title">${this.dataset.label}</span>
    ${tagsHTML}
    </div>`;
  }
}
