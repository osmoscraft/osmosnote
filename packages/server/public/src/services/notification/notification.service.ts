import type { ComponentRefService } from "../component-reference/component-ref.service";

export class NotificationService {
  constructor(private componentRefs: ComponentRefService) {}

  displayMessage(text: string, kind: "error" | "info" | "warning" = "info") {
    this.componentRefs.statusBar.setMessage(text, kind);
  }

  setChangeStatus(isDirty: boolean) {
    this.componentRefs.statusBar.setChangeStatus(isDirty);
  }
}
