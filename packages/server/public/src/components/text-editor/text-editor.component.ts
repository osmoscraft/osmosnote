import { ApiService } from "../../services/api/api.service.js";
import { HistoryService } from "../../services/history/history.service.js";
import { RouteService } from "../../services/route/route.service.js";
import { di } from "../../utils/dependency-injector.js";
import { CaretService } from "./caret.service.js";
import { EditService } from "./edit.service.js";
import { FormatService } from "./format.service.js";
import { sourceToLines } from "./helpers/source-to-lines.js";
import { getNoteFromTemplate } from "./helpers/template.js";
import { InputService } from "./input.service.js";
import { MeasureService } from "./measure.service.js";

export class TextEditorComponent extends HTMLElement {
  private routeService!: RouteService;
  private noteService!: ApiService;
  private inputService!: InputService;
  private historyService!: HistoryService;
  private caretService!: CaretService;
  private editService!: EditService;
  private formatService!: FormatService;
  private measureService!: MeasureService;

  private _host!: HTMLElement;

  get host() {
    return this._host;
  }

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <div id="content-host" spellcheck="false" contenteditable="true"></div>`;

    this.routeService = di.getSingleton(RouteService);
    this.noteService = di.getSingleton(ApiService);
    this.inputService = di.getSingleton(InputService);
    this.historyService = di.getSingleton(HistoryService);
    this.caretService = di.getSingleton(CaretService);
    this.editService = di.getSingleton(EditService);
    this.formatService = di.getSingleton(FormatService);
    this.measureService = di.getSingleton(MeasureService);

    this._host = this.querySelector("#content-host") as HTMLElement;

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
    this.formatService.parseDocument(this.host);

    this.caretService.init(this.host);
    this.measureService.init(this.host);
    this.inputService.init(this.host);

    this.historyService.save(this.host);
  }

  pasteText(text: string) {
    this.historyService.runAtomic(this.host, () => this.editService.cursorPaste(text, this.host));
  }
}
