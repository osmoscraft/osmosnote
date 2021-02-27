import { ApiService } from "../../services/api/api.service.js";
import { HistoryService } from "../../services/history/history.service.js";
import { RouteService } from "../../services/route/route.service.js";
import { di } from "../../utils/dependency-injector.js";
import { cursorPaste } from "./helpers/curosr/cursor-edit.js";
import { renderDefaultCursor } from "./helpers/curosr/cursor-select.js";
import { calculateMeasure, setMeasure } from "./helpers/line/line-measure.js";
import { parseDocument } from "./helpers/parse.js";
import { sourceToLines } from "./helpers/source-to-lines.js";
import { getNoteFromTemplate } from "./helpers/template.js";
import { InputService } from "./input.service.js";

export class TextEditorComponent extends HTMLElement {
  get host() {
    return this.#host;
  }

  private routeService!: RouteService;
  private noteService!: ApiService;
  private inputService!: InputService;
  private historyService!: HistoryService;
  #host!: HTMLElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <div id="content-host" spellcheck="false" contenteditable="true"></div>`;

    this.routeService = di.getSingleton(RouteService);
    this.noteService = di.getSingleton(ApiService);
    this.inputService = di.getSingleton(InputService);
    this.historyService = di.getSingleton(HistoryService);

    this.#host = this.querySelector("#content-host") as HTMLElement;

    this.init();
  }

  async init() {
    const { id, url, content, title } = this.routeService.getNoteConfigFromUrl();
    let note = "";
    if (id) {
      const data = await this.noteService.loadNote(id);
      note = data.note;
    } else {
      note = getNoteFromTemplate({ title, url, content });
    }

    const dom = sourceToLines(note);

    this.host.appendChild(dom);
    parseDocument(this.host);
    renderDefaultCursor(this.host);

    this.historyService.save(this.host);

    this.inputService.handleEvents();

    window.addEventListener("resize", this.updateMeausre);
    this.updateMeausre();
  }

  pasteText(text: string) {
    cursorPaste(text, this.host);
    this.historyService.save(this.host);
  }

  private updateMeausre() {
    const measure = calculateMeasure(this.host);
    setMeasure(measure);
  }
}
