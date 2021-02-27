import { emit } from "../../utils/events.js";

export interface NoteCreatedDetail {
  id: string;
  title: string;
}

export class RemoteClientService {
  notifyNoteCreated(detail: NoteCreatedDetail) {
    try {
      if (window.opener && (window.opener as Window)?.location?.host === location.host) {
        emit(window.opener, "remote-service:child-note-created", {
          detail,
        });
      }
    } catch (error) {
      console.log("[window-bridge] opener is not the same host");
    }
  }
}
