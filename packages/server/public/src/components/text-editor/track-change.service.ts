import type { NotificationService } from "../../services/notification/notification.service";
import type { WindowRefService } from "../../services/window-reference/window.service";

export class TrackChangeService {
  private savedText!: string | null;
  private _isDirty = false;
  private _isNew = false;

  constructor(private notificationService: NotificationService, private windowRef: WindowRefService) {
    this.windowRef.window.addEventListener("beforeunload", (event) => {
      if (this._isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    });
  }

  init({ isNew = false, isDirty = false } = {}) {
    this._isNew = isNew;
    this._isDirty = isDirty;
    if (this._isNew) {
      this.notificationService.setChangeStatus("new");
    } else {
      this.notificationService.setChangeStatus(isDirty ? "dirty" : "clean");
    }
  }

  trackByText(text?: string) {
    if (text === undefined) return;
    const isDirty = this.savedText !== text;
    this.trackByState(isDirty);
  }

  trackByState(isDirty: boolean) {
    if (isDirty !== this._isDirty) {
      this._isDirty = isDirty;
      if (!this._isNew) {
        this.notificationService.setChangeStatus(isDirty ? "dirty" : "clean");
      }
    }
  }

  /**
   * Set text to null indicates the state has no text
   */
  set(text: string | null, isDirty: boolean, isNew: boolean = false) {
    this.savedText = text;

    if (isNew !== undefined) {
      this._isNew = isNew;
    }

    this._isDirty = isDirty;
    if (!this._isNew) {
      this.notificationService.setChangeStatus(isDirty ? "dirty" : "clean");
    }
  }

  isNew() {
    return this._isNew;
  }

  isDirty() {
    return this._isDirty;
  }
}
