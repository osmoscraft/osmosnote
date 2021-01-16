import { ProxyService } from "./services/proxy.service";
import { di } from "./utils/dependency-injector";
import { filenameToId } from "./utils/id";
import { getNoteConfigFromUrl } from "./utils/url";
import type { GetNoteReply } from "@system-two/server";

di.registerClass(ProxyService, []);

async function loadNote() {
  const { filename, title, content, url } = getNoteConfigFromUrl();

  const proxy = di.getSingleton(ProxyService);

  if (filename) {
    // load existing note
    const id = filenameToId(filename);
    const result = await proxy.get<GetNoteReply>(`/api/notes/${encodeURIComponent(id)}`);
  }
}

loadNote();
