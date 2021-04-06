import type { ChangeSatus } from "../../components/status-bar/status-bar.component";
import type { ComponentRefService } from "../component-reference/component-ref.service";

export class NotificationService {
  constructor(private componentRefs: ComponentRefService) {}

  displayMessage(text: string, kind: "error" | "info" | "warning" = "info") {
    this.componentRefs.statusBar.setMessage(text, kind);
  }

  setChangeStatus(status: ChangeSatus) {
    this.componentRefs.statusBar.setChangeStatus(status);
  }
}
