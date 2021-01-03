import { emit } from "../../utils/events";
import type { ComponentReferenceService } from "../component-reference/component-reference.service";

export interface NoteCreatedDetail {
  id: string;
  title: string;
}

declare global {
  interface GlobalEventHandlersEventMap {
    "command-bar:child-note-created": CustomEvent<NoteCreatedDetail>;
  }
}

export class WindowBridgeService {
  constructor(private componentRefs: ComponentReferenceService) {
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChildNoteCreated = this.handleChildNoteCreated.bind(this);
  }

  insertNoteLinkAfterCreated(openUrl: string) {
    // we can handle one action at a time, so stop handling any previous action
    this.cancelInsertLinkOnSave();

    this.componentRefs.statusBar.setMessage("Save child note to insert, [ESC] to cancel", "warning");

    window.addEventListener("command-bar:child-note-created", this.handleChildNoteCreated);
    window.addEventListener("keydown", this.handleCancel, { capture: true });

    window.open(openUrl);
  }

  notifyNoteCreated(detail: NoteCreatedDetail) {
    try {
      if (window.opener && (window.opener as Window)?.location?.host === location.host) {
        emit(window.opener, "command-bar:child-note-created", {
          detail,
        });
      }
    } catch (error) {
      console.log("[window-bridge] opener is not the same host");
    }
  }

  private handleChildNoteCreated(ev: CustomEvent<NoteCreatedDetail>) {
    const insertion = `[${ev.detail.title}](${ev.detail.id})`;

    this.componentRefs.textEditor.insertAtCursor(insertion);
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
    window.removeEventListener("command-bar:child-note-created", this.handleChildNoteCreated);
  }
}
