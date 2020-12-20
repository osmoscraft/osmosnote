import { editableNoteToMarkdown, markdownToEditableHtml, markdownToOverlayHtml } from "../../lib/codec";
import { emit } from "../../lib/events";

declare global {
  interface GlobalEventHandlersEventMap {
    "content-host:start-modal-search": CustomEvent<never>;
  }
}

export class ContentHost extends HTMLElement {
  noteEditableDom!: HTMLElement;
  noteOverlayDom!: HTMLElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <div class="note-shared" id="note-editable" contenteditable="true"></div>
    <div class="note-shared" id="note-overlay"></div>`;

    this.noteEditableDom = this.querySelector("#note-editable") as HTMLElement;
    this.noteOverlayDom = this.querySelector("#note-overlay") as HTMLElement;

    this.attachOverlayObserver();
    this.handleEvents();
  }

  getMarkdown(): string {
    return editableNoteToMarkdown(this.noteEditableDom);
  }

  private handleEvents() {
    // TODO use event bus to hand off focus
    this.noteEditableDom.addEventListener("keydown", (event) => {
      if (event.key === "/") {
        event.stopPropagation();
        event.preventDefault();

        emit(this, "content-host:start-modal-search");
      }
    });
  }

  // When editable dom has any change, re-render overlay
  private attachOverlayObserver() {
    const observer = new MutationObserver(() => {
      const markdown = editableNoteToMarkdown(this.noteEditableDom);
      this.noteOverlayDom.innerHTML = markdownToOverlayHtml(markdown);
    });

    observer.observe(this.noteEditableDom, { subtree: true, childList: true, characterData: true });
  }

  loadMarkdown(markdown: string) {
    this.noteEditableDom.innerHTML = markdownToEditableHtml(markdown);
  }
}

customElements.define("s2-content-host", ContentHost);
