import type { GetNoteInput, GetNoteOutput } from "@system-two/server";
import { renderDefaultCursor } from "../curosr/cursor-select.js";
import { historyService } from "../history/history-service.js";
import { parseDocument } from "../parse.js";
import { query } from "../query.js";
import { getNoteConfigFromUrl } from "../route.js";
import { sourceToLines } from "../source-to-lines.js";

export async function loadNote() {
  const { id } = getNoteConfigFromUrl();

  if (id) {
    const { data, error } = await query<GetNoteOutput, GetNoteInput>(`/api/get-note`, { id });

    if (data?.note) {
      const dom = sourceToLines(data.note);

      const host = document.querySelector("#content-host") as HTMLElement;

      host.appendChild(dom);
      parseDocument(host);
      renderDefaultCursor(host);

      historyService.save(host);
    }

    if (error) {
      console.error(error);
    }
  }
}
