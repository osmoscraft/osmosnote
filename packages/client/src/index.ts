import type { GetNoteReply } from "@system-two/server/src/routes/note";
import { CommandBarComponent } from "./components/command-bar/command-bar.component";
import { ContentHostComponent } from "./components/content-host/content-host.component";
import { DocumentHeaderComponent } from "./components/document-header/document-header.component";
import { ReferencePanelComponent } from "./components/reference-panel/reference-panel.component";
import { StatusBarComponent } from "./components/status-bar/status-bar.component";
import { restoreRange } from "./lib/curosr";
import { filenameToId } from "./lib/id";
import { getNoteConfigFromUrl } from "./lib/url";

customElements.define("s2-command-bar", CommandBarComponent);
customElements.define("s2-content-host", ContentHostComponent);
customElements.define("s2-document-header", DocumentHeaderComponent);
customElements.define("s2-status-bar", StatusBarComponent);
customElements.define("s2-reference-panel", ReferencePanelComponent);

const contentHost = document.querySelector("s2-content-host") as ContentHostComponent;
const commandBar = document.querySelector("s2-command-bar") as CommandBarComponent;
const documentHeader = document.querySelector("s2-document-header") as DocumentHeaderComponent;
const referencePanel = document.querySelector("s2-reference-panel") as ReferencePanelComponent;

async function loadNote() {
  const { filename, title, content } = getNoteConfigFromUrl();

  if (filename) {
    // load existing note
    const id = filenameToId(filename);
    const result = await loadExistingNote(id);
    contentHost.loadMarkdown(result.note.content);
    documentHeader.setTitle(result.note.metadata.title);
    referencePanel.setIncomingConnections(result.incomingConnections);

    commandBar.addEventListener("command-bar:did-cancel", () => {
      restoreRange();
    });

    commandBar.addEventListener("command-bar:did-execute", () => {
      restoreRange();
    });
  } else {
    // prepare for new note
    documentHeader.setTitle(title ?? `New note on ${new Date().toLocaleString()}`);
    contentHost.loadMarkdown(content ?? `An idea starts here...`);
  }
}

async function loadExistingNote(id: string) {
  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`);
  const result: GetNoteReply = await response.json();

  return result;
}

loadNote();
