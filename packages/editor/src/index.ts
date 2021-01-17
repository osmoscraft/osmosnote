import { ApiService } from "./services/api.service";
import { di } from "./utils/dependency-injector";
import { getNoteConfigFromUrl } from "./utils/url";
import type { GetNoteInput, GetNoteOutput } from "@system-two/server";
import { ComponentReferenceService } from "./services/component-reference.service";

di.registerClass(ComponentReferenceService, []);
di.registerClass(ApiService, []);

di.getSingleton(ComponentReferenceService).init();

async function loadNote() {
  const { id } = getNoteConfigFromUrl();

  const api = di.getSingleton(ApiService);
  const componentRefs = di.getSingleton(ComponentReferenceService);

  if (id) {
    const { data, error } = await api.fetch<GetNoteOutput, GetNoteInput>(`/api/get-note`, { id });

    if (data?.note) {
      componentRefs.textEditor.loadText(data.note);
    }

    if (error) {
      console.error(error);
    }
  }
}

loadNote();
