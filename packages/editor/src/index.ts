import { ProxyService } from "./services/proxy.service";
import { di } from "./utils/dependency-injector";
import { getNoteConfigFromUrl } from "./utils/url";
import type { GetNoteReply } from "@system-two/server";
import { ComponentReferenceService } from "./services/component-reference.service";

di.registerClass(ComponentReferenceService, []);
di.registerClass(ProxyService, []);

di.getSingleton(ComponentReferenceService).init();

async function loadNote() {
  const { id, title, content, url } = getNoteConfigFromUrl();

  const proxy = di.getSingleton(ProxyService);
  const componentRefs = di.getSingleton(ComponentReferenceService);

  if (id) {
    // load existing note
    const result = await proxy.get<GetNoteReply>(`/api/notes/${encodeURIComponent(id)}`);
    console.log(result);

    componentRefs.textEditor.setText(result.note.content);
  }
}

loadNote();
