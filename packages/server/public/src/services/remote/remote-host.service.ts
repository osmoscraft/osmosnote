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
  private callbackWithCleanUp: null | ((ev: CustomEvent<NoteCreatedDetail>) => any) = null;

  constructor(private componentRefs: ComponentRefService) {
    this.handleCancel = this.handleCancel.bind(this);
  }

  runOnNewNote(openUrl: string, callback: (ev: CustomEvent<NoteCreatedDetail>) => any) {
    // we can handle one action at a time, so stop handling any previous action
    this.cancelInsertLinkOnSave();

    this.callbackWithCleanUp = (ev: CustomEvent<NoteCreatedDetail>) => {
      callback(ev);
      this.cancelInsertLinkOnSave();
    };

    this.componentRefs.statusBar.setMessage("Waiting for remote window event, [PRESS ANY KEY] to cancel", "warning");

    window.addEventListener("remote-service:child-note-created", this.callbackWithCleanUp);
    window.addEventListener("keydown", this.handleCancel, { capture: true });

    window.open(openUrl);
  }

  private handleCancel(e: KeyboardEvent) {
    this.cancelInsertLinkOnSave();
    this.componentRefs.statusBar.setMessage(`Cancelled`);
    console.log("[command-bar] cancelled handling child note created");

    e.preventDefault();
    e.stopPropagation();
  }

  private cancelInsertLinkOnSave() {
    window.removeEventListener("keydown", this.handleCancel, { capture: true });
    if (this.callbackWithCleanUp) {
      window.removeEventListener("remote-service:child-note-created", this.callbackWithCleanUp);
      this.callbackWithCleanUp = null;
    }
  }
}
