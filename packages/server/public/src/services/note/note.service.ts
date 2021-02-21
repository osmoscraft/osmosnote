import type { GetNoteInput, GetNoteOutput, UpdateNoteInput, UpdateNoteOutput } from "@system-two/server";
import { getNoteConfigFromUrl } from "./route.js";
import type { HistoryService } from "../history/history.service.js";
import type { ProxyService } from "../proxy/proxy.service.js";
import { renderDefaultCursor } from "../shared/curosr/cursor-select.js";
import { calculateMeasure, setMeasure } from "../shared/line/line-measure.js";
import { getPortableText } from "../shared/line/line-query.js";
import { parseDocument } from "../shared/parse.js";
import { sourceToLines } from "../shared/source-to-lines.js";

export class NoteService {
  constructor(private historySerivce: HistoryService, private proxyService: ProxyService) {}

  async init() {
    await this.loadNote();

    function updateMeausre() {
      const measure = calculateMeasure(document.querySelector("#content-host") as HTMLElement);
      setMeasure(measure);
    }

    window.addEventListener("resize", updateMeausre);
    updateMeausre();
  }

  public async loadNote() {
    const { id } = getNoteConfigFromUrl();

    if (id) {
      const { data, error } = await this.proxyService.query<GetNoteOutput, GetNoteInput>(`/api/get-note`, { id });

      if (data?.note) {
        const dom = sourceToLines(data.note);

        const host = document.querySelector("#content-host") as HTMLElement;

        host.appendChild(dom);
        parseDocument(host);
        renderDefaultCursor(host);

        this.historySerivce.save(host);
      }

      if (error) {
        console.error(error);
      }
    }
  }

  public async updateNote() {
    const { id } = getNoteConfigFromUrl();

    try {
      if (id) {
        const host = document.querySelector("#content-host") as HTMLElement;
        const lines = [...host.querySelectorAll("[data-line]")] as HTMLElement[];
        const note = getPortableText(lines);

        const { data, error } = await this.proxyService.query<UpdateNoteOutput, UpdateNoteInput>(`/api/update-note`, {
          id,
          note,
        });
        if (error) throw error;

        console.log("[note] saved");
      }
    } catch (error) {
      console.error(error);
    }
  }
}
