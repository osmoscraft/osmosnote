import { CommandBarComponent } from "../../components/command-bar/command-bar.component";
import { ContentHostComponent } from "../../components/content-host/content-host.component";
import { DocumentHeaderComponent } from "../../components/document-header/document-header.component";
import { ReferencePanelComponent } from "../../components/reference-panel/reference-panel.component";
import { StatusBarComponent } from "../../components/status-bar/status-bar.component";

export class ComponentReferenceService {
  get commandBar() {
    return document.querySelector("s2-command-bar") as CommandBarComponent;
  }
  get contentHost() {
    return document.querySelector("s2-content-host") as ContentHostComponent;
  }
  get documentHeader() {
    return document.querySelector("s2-document-header") as DocumentHeaderComponent;
  }
  get referencePanel() {
    return document.querySelector("s2-reference-panel") as ReferencePanelComponent;
  }
  get statusBar() {
    return document.querySelector("s2-status-bar") as StatusBarComponent;
  }

  mount() {
    customElements.define("s2-command-bar", CommandBarComponent);
    customElements.define("s2-content-host", ContentHostComponent);
    customElements.define("s2-document-header", DocumentHeaderComponent);
    customElements.define("s2-reference-panel", ReferencePanelComponent);
    customElements.define("s2-status-bar", StatusBarComponent);
  }
}