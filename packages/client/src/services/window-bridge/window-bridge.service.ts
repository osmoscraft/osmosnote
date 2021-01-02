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
  private activeChildNoteCreatedHandler: ((e: any) => void) | null = null;
  private activeCancelHandler: ((e: any) => void) | null = null;

  constructor(private componentRefs: ComponentReferenceService) {}

  insertNoteLinkAfterCreated(openUrl: string) {
    // we can handle one action at a time, so stop handling any previous action
    this.cancelInsertLinkOnSave();

    this.componentRefs.statusBar.setMessage("Save child note to insert, [ESC] to cancel", "warning");

    const handleChildNoteCreated = (ev: CustomEvent<NoteCreatedDetail>) => {
      const insertion = `[${ev.detail.title}](${ev.detail.id})`;

      this.componentRefs.textEditor.insertAtCursor(insertion);
      this.componentRefs.statusBar.setMessage(`Inserted: "${insertion}"`);
      this.cancelInsertLinkOnSave();
    };

    const handleCancel = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.cancelInsertLinkOnSave();
        this.componentRefs.statusBar.setMessage(`Cancelled`);
        console.log("[command-bar] cancelled handling child note created");

        e.preventDefault();
        e.stopPropagation();
      }
    };

    this.activeChildNoteCreatedHandler = handleChildNoteCreated;
    this.activeCancelHandler = handleCancel;

    window.addEventListener("command-bar:child-note-created", handleChildNoteCreated);
    window.addEventListener("keydown", handleCancel, { capture: true });

    window.open(openUrl);
  }

  notifyNoteCreated(detail: NoteCreatedDetail) {
    if (window.opener) {
      emit(window.opener, "command-bar:child-note-created", {
        detail,
      });
    }
  }

  private cancelInsertLinkOnSave() {
    if (this.activeCancelHandler) {
      window.removeEventListener("keydown", this.activeCancelHandler);
      this.activeCancelHandler = null;
    }

    if (this.activeChildNoteCreatedHandler) {
      window.removeEventListener("command-bar:child-note-created", this.activeChildNoteCreatedHandler);
      this.activeChildNoteCreatedHandler = null;
    }
  }
}
