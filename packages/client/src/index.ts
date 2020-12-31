import type { GetNoteReply } from "@system-two/server/src/routes/note";
import { di } from "./utils/dependency-injector";
import { filenameToId } from "./utils/id";
import { getNoteConfigFromUrl } from "./utils/url";
import { ComponentReferenceService } from "./services/component-reference/component-reference.service";
import { CursorSelectionService } from "./services/cursor-selection/cursor-selection.service";
import { HistoryService } from "./services/history/history.service";
import { ProxyService } from "./services/proxy/proxy.service";
import { SourceControlService } from "./services/source-control/source-control.service";
import { FileStorageService } from "./services/file-storage/file-storage.service";

di.registerClass(ComponentReferenceService, []);
di.registerClass(ProxyService, []);
di.registerClass(SourceControlService, [ProxyService]);
di.registerClass(FileStorageService, [ProxyService]);
di.registerClass(CursorSelectionService, [ComponentReferenceService]);
di.registerClass(HistoryService, []);

// calling mount will trigger constructors within each custom element
// to avoid circular dependency, don't mount until all services are registered
di.getSingleton(ComponentReferenceService).init();
di.getSingleton(CursorSelectionService).init();

async function loadNote() {
  const { filename, title, content, url } = getNoteConfigFromUrl();
  const componentRefs = di.getSingleton(ComponentReferenceService);

  if (filename) {
    // load existing note
    const id = filenameToId(filename);
    const result = await loadExistingNote(id);

    // experimental
    componentRefs.textEditor.setFileText(result.note.content);

    componentRefs.documentHeader.setData({ id, metadata: result.note.metadata });
    componentRefs.referencePanel.setIncomingConnections(result.incomingConnections);
  } else {
    // prepare for new note
    const newTitle = title ?? `New note on ${new Date().toLocaleString()}`;
    componentRefs.documentHeader.setData({ metadata: { title: newTitle, url: url ?? undefined } });

    // experimental
    componentRefs.textEditor.setFileText(content ?? "");
  }
}

async function loadExistingNote(id: string) {
  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`);
  const result: GetNoteReply = await response.json();

  return result;
}

async function checkVersions() {
  const sourceControlService = di.getSingleton(SourceControlService);
  const componentRefs = di.getSingleton(ComponentReferenceService);

  const versionResult = await sourceControlService.check();
  componentRefs.statusBar.showText(versionResult.message);
}

loadNote();
checkVersions();
