import type { GetNoteReply } from "@system-two/server/src/routes/note";
import { di } from "./lib/dependency-injector";
import { filenameToId } from "./lib/id";
import { getNoteConfigFromUrl } from "./lib/url";
import { ComponentReferenceService } from "./services/component-reference/component-reference.service";
import { CursorService } from "./services/cursor/cursor.service";

di.registerClass(CursorService, []);
di.registerClass(ComponentReferenceService, []);

// calling mount will trigger constructors within each custom element
// to avoid circular dependency, don't mount until all services are registered
di.getSingleton(ComponentReferenceService).mount();

async function loadNote() {
  const { filename, title, content } = getNoteConfigFromUrl();
  const componentRefs = di.getSingleton(ComponentReferenceService);

  if (filename) {
    // load existing note
    const id = filenameToId(filename);
    const result = await loadExistingNote(id);
    componentRefs.contentHost.loadMarkdown(result.note.content);
    componentRefs.documentHeader.setTitle(result.note.metadata.title);
    componentRefs.referencePanel.setIncomingConnections(result.incomingConnections);
  } else {
    // prepare for new note
    componentRefs.documentHeader.setTitle(title ?? `New note on ${new Date().toLocaleString()}`);
    componentRefs.contentHost.loadMarkdown(content ?? `An idea starts here...`);
  }
}

async function loadExistingNote(id: string) {
  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`);
  const result: GetNoteReply = await response.json();

  return result;
}

loadNote();
