import { editableNoteToMarkdown, markdownToEditableHtml, markdownToOverlayHtml } from "../../lib/codec";
import "./content-host.css";

export class ContentHostComponent extends HTMLElement {
  noteEditableDom!: HTMLElement;
  noteOverlayDom!: HTMLElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <div class="cntcnt-scroll-area">
      <div class="note-shared" id="note-editable" contenteditable="true"></div>
      <div class="note-shared" id="note-overlay"></div>
    </div>
    `;

    this.noteEditableDom = this.querySelector("#note-editable") as HTMLElement;
    this.noteOverlayDom = this.querySelector("#note-overlay") as HTMLElement;

    this.attachOverlayObserver();
  }

  getMarkdown(): string {
    return editableNoteToMarkdown(this.noteEditableDom);
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
