import type { GetNoteReply } from "@system-two/server/src/routes/note";
import "./components/command-bar/command-bar.component";
import type { CommandBarComponent } from "./components/command-bar/command-bar.component";
import "./components/content-host/content-host.component";
import type { ContentHostComponent } from "./components/content-host/content-host.component";
import "./components/document-header/document-header.component";
import type { DocumentHeaderComponent } from "./components/document-header/document-header.component";
import "./components/status-bar/status-bar.component";
import "./components/reference-panel/reference-panel.component";
import { restoreRange } from "./lib/curosr";
import { filenameToId } from "./lib/id";
import { getNoteConfigFromUrl } from "./lib/url";

const contentHost = document.querySelector("s2-content-host") as ContentHostComponent;
const commandBar = document.querySelector("s2-command-bar") as CommandBarComponent;
const documentHeader = document.querySelector("s2-document-header") as DocumentHeaderComponent;

async function loadNote() {
  const { filename, title, content } = getNoteConfigFromUrl();

  if (filename) {
    // load existing note
    const id = filenameToId(filename);
    const result = await loadExistingNote(id);
    contentHost.loadMarkdown(result.note.content);

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

  documentHeader.setTitle(result.note.metadata.title);
  return result;
}

loadNote();
