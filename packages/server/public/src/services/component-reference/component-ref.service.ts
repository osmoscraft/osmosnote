import type { CommandBarComponent } from "../../components/command-bar/command-bar.component.js";
import type { StatusBarComponent } from "../../components/status-bar/status-bar.component.js";
import type { TextEditorComponent } from "../../components/text-editor/text-editor.component.js";

export class ComponentRefService {
  get commandBar() {
    return document.querySelector("s2-command-bar") as CommandBarComponent;
  }
  get textEditor() {
    return document.querySelector("s2-text-editor") as TextEditorComponent;
  }
  get statusBar() {
    return document.querySelector("s2-status-bar") as StatusBarComponent;
  }
}
