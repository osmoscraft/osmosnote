import { editableNoteToMarkdown, markdownToEditableHtml, markdownToOverlayHtml } from "./core/codec";
import { di } from "../../utils/dependency-injector";
import { CursorService, WithCursorService } from "../../services/cursor/cursor.service";
import "./content-editor.css";

export class ContentEditorComponent extends HTMLElement implements WithCursorService {
  noteEditableDom!: HTMLElement;
  noteOverlayDom!: HTMLElement;
  cursorService = di.createShallow(CursorService);

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

    this.cursorService.attach(this);
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
