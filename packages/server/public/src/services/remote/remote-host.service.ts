import type { ComponentRefService } from "../component-reference/component-ref.service.js";

export interface NoteCreatedDetail {
  id: string;
  title: string;
}

declare global {
  interface GlobalEventHandlersEventMap {
    "remote-service:child-note-created": CustomEvent<NoteCreatedDetail>;
  }
}

export class RemoteHostService {
  constructor(private componentRefs: ComponentRefService) {
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChildNoteCreated = this.handleChildNoteCreated.bind(this);
  }

  insertNoteLinkAfterCreated(openUrl: string) {
    // we can handle one action at a time, so stop handling any previous action
    this.cancelInsertLinkOnSave();

    this.componentRefs.statusBar.setMessage("Waiting for remote window event, [ESC] to cancel", "warning");

    window.addEventListener("remote-service:child-note-created", this.handleChildNoteCreated);
    window.addEventListener("keydown", this.handleCancel, { capture: true });

    window.open(openUrl);
  }

  private handleChildNoteCreated(ev: CustomEvent<NoteCreatedDetail>) {
    const insertion = `[${ev.detail.title}](${ev.detail.id})`;

    this.componentRefs.textEditor.pasteText(insertion);
    this.componentRefs.statusBar.setMessage(`Inserted: "${insertion}"`);
    this.cancelInsertLinkOnSave();
  }

  private handleCancel(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.cancelInsertLinkOnSave();
      this.componentRefs.statusBar.setMessage(`Cancelled`);
      console.log("[command-bar] cancelled handling child note created");

      e.preventDefault();
      e.stopPropagation();
    }
  }

  private cancelInsertLinkOnSave() {
    window.removeEventListener("keydown", this.handleCancel, { capture: true });
    window.removeEventListener("remote-service:child-note-created", this.handleChildNoteCreated);
  }
}
