import type { ComponentRefService } from "../component-reference/component-ref.service";

export class NotificationService {
  constructor(private componentRefs: ComponentRefService) {}

  displayMessage(text: string, kind: "error" | "info" | "warning" = "info") {
    this.componentRefs.statusBar.innerText = `${text} ${new Date().toLocaleTimeString()}`;
    this.componentRefs.statusBar.dataset.kind = kind;
  }
}
