import { TextEditorComponent } from "../components/text-editor/text-editor.component";

export class ComponentReferenceService {
  get textEditor() {
    return document.querySelector("s2-text-editor") as TextEditorComponent;
  }

  init() {
    customElements.define("s2-text-editor", TextEditorComponent);
  }
}
