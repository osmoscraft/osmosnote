import { editableNoteToMarkdown, markdownToEditableHtml, markdownToOverlayHtml } from "./core/codec";
import { di } from "../../utils/dependency-injector";
import {
  CursorSnapshotService,
  WithCursorSnapshotService,
} from "../../services/cursor-snapshot/cursor-snapshot.service";
import "./content-editor.css";

export class ContentEditorComponent extends HTMLElement implements WithCursorSnapshotService {
  noteEditableDom!: HTMLElement;
  noteOverlayDom!: HTMLElement;
  cursorSnapshotService = di.createShallow(CursorSnapshotService);

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

    this.cursorSnapshotService.attach(this);
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
