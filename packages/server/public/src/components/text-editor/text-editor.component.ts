import { ApiService } from "../../services/api/api.service.js";
import { HistoryService } from "../../services/history/history.service.js";
import { RouteService } from "../../services/route/route.service.js";
import { di } from "../../utils/dependency-injector.js";
import { renderDefaultCursor } from "./helpers/curosr/cursor-select.js";
import { calculateMeasure, setMeasure } from "./helpers/line/line-measure.js";
import { parseDocument } from "./helpers/parse.js";
import { sourceToLines } from "./helpers/source-to-lines.js";
import { InputService } from "./input.service.js";

export class TextEditorComponent extends HTMLElement {
  private routeService!: RouteService;
  private noteService!: ApiService;
  private inputService!: InputService;
  private historyService!: HistoryService;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <div id="content-host" spellcheck="false" contenteditable="true"></div>`;

    this.routeService = di.getSingleton(RouteService);
    this.noteService = di.getSingleton(ApiService);
    this.inputService = di.getSingleton(InputService);
    this.historyService = di.getSingleton(HistoryService);

    this.init();
  }

  async init() {
    const { id } = this.routeService.getNoteConfigFromUrl();
    if (id) {
      const data = await this.noteService.loadNote(id);
      const dom = sourceToLines(data.note);

      const host = document.querySelector("#content-host") as HTMLElement;

      host.appendChild(dom);
      parseDocument(host);
      renderDefaultCursor(host);

      this.historyService.save(host);

      this.inputService.handleEvents();
    }

    window.addEventListener("resize", this.updateMeausre);
    this.updateMeausre();
  }

  private updateMeausre() {
    const measure = calculateMeasure(document.querySelector("#content-host") as HTMLElement);
    setMeasure(measure);
  }
}
