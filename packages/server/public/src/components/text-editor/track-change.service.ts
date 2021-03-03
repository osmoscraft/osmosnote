import type { NotificationService } from "../../services/notification/notification.service";
import type { WindowRefService } from "../../services/window-reference/window.service";

export class TrackChangeService {
  private savedText!: string | null;
  private _isDirty = false;

  constructor(private notificationService: NotificationService, private windowRef: WindowRefService) {
    this.windowRef.window.addEventListener("beforeunload", (event) => {
      if (this._isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    });
  }

  trackByText(text?: string) {
    if (text === undefined) return;
    const isDirty = this.savedText !== text;
    this.trackByState(isDirty);
  }

  trackByState(isDirty: boolean) {
    if (isDirty !== this._isDirty) {
      this._isDirty = isDirty;
      this.notificationService.setChangeStatus(isDirty);
    }
  }

  /**
   * Set text to null indicates the state has no text
   */
  set(text: string | null, isDirty: boolean) {
    this.savedText = text;
    this._isDirty = isDirty;
    this.notificationService.setChangeStatus(isDirty);
  }

  isDirty() {
    return this._isDirty;
  }
}
