import { ApiService } from "../../services/api/api.service.js";
import { DocumentRefService } from "../../services/document-reference/document.service.js";
import { NotificationService } from "../../services/notification/notification.service.js";
import { PreferencesService } from "../../services/preferences/preferences.service.js";
import { RemoteHostService } from "../../services/remote/remote-host.service.js";
import { RouteService } from "../../services/route/route.service.js";
import { di } from "../../utils/dependency-injector.js";
import { CaretContext, CaretService } from "./caret.service.js";
import { CompileService } from "./compiler/compile.service.js";
import { EditService } from "./edit.service.js";
import { sourceToLines } from "./helpers/source-to-lines.js";
import { getNoteFromTemplate } from "./helpers/template.js";
import { HistoryService } from "./history/history.service.js";
import { InputService } from "./input.service.js";
import { LineQueryService } from "./line-query.service.js";
import { MeasureService } from "./measure.service.js";
import { SyncService } from "./sync.service.js";
import { TrackChangeService } from "./track-change.service.js";

export interface InsertFunction {
  (context: CaretContext): string | Promise<string>;
}

export interface InsertContext {
  textBefore: string;
  textAfter: string;
  textSelected: string;
}

export class TextEditorComponent extends HTMLElement {
  private apiService!: ApiService;
  private caretService!: CaretService;
  private documentRef!: DocumentRefService;
  private editService!: EditService;
  private formatService!: CompileService;
  private historyService!: HistoryService;
  private inputService!: InputService;
  private lineQueryService!: LineQueryService;
  private measureService!: MeasureService;
  private notificationService!: NotificationService;
  private preferencesService!: PreferencesService;
  private remoteHostService!: RemoteHostService;
  private routeService!: RouteService;
  private syncService!: SyncService;
  private trackChangeService!: TrackChangeService;

  private _host!: HTMLElement;

  get host() {
    return this._host;
  }

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <div id="content-host" spellcheck="false" contenteditable="true"></div>`;

    this.apiService = di.getSingleton(ApiService);
    this.caretService = di.getSingleton(CaretService);
    this.documentRef = di.getSingleton(DocumentRefService);
    this.editService = di.getSingleton(EditService);
    this.formatService = di.getSingleton(CompileService);
    this.historyService = di.getSingleton(HistoryService);
    this.inputService = di.getSingleton(InputService);
    this.lineQueryService = di.getSingleton(LineQueryService);
    this.measureService = di.getSingleton(MeasureService);
    this.notificationService = di.getSingleton(NotificationService);
    this.preferencesService = di.getSingleton(PreferencesService);
    this.remoteHostService = di.getSingleton(RemoteHostService);
    this.routeService = di.getSingleton(RouteService);
    this.syncService = di.getSingleton(SyncService);
    this.trackChangeService = di.getSingleton(TrackChangeService);

    this._host = this.querySelector("#content-host") as HTMLElement;

    this.init();
  }

  async init() {
    const { id, url, content, title } = this.routeService.getNoteConfigFromUrl();
    let finalContent = "";
    let finalTitle = "";

    if (id) {
      try {
        const data = await this.apiService.loadNote(id);
        finalTitle = data.title;
        finalContent = data.note;
      } catch {
        this.notificationService.displayMessage(
          `Error loading note with id ${id}, [ENTER] to open a new note`,
          "error"
        );
        window.addEventListener("keydown", (event) => event.key === "Enter" && location.replace("/"));
        return;
      }
    } else {
      const { note, title: newTitle } = getNoteFromTemplate({ title, url, content });
      finalTitle = newTitle;
      finalContent = note;
    }

    this.documentRef.document.title = finalTitle;

    this.syncService.checkAllFileVersions();

    const dom = sourceToLines(finalContent);

    this.host.appendChild(dom);
    this.formatService.compile(this.host);

    this.caretService.init(this.host);
    this.measureService.init(this.host);
    this.inputService.init(this.host);

    this.historyService.save(this.host);

    const isNewNote = id === undefined;
    this.trackChangeService.init({ isNew: isNewNote });
    this.trackChangeService.set(isNewNote ? null : this.historyService.peek()!.textContent, false, isNewNote);

    if (isNewNote) {
      this.caretService.moveDocumentEnd(this.host);
    }

    const preferences = this.preferencesService.getPreferences();
    this.toggleSpellcheck(preferences.spellcheck);

    // Store and recover caret position across page loads
    if (id) {
      const storedCaret = sessionStorage.getItem(id);
      if (storedCaret) {
        this.caretService.deserializePosition(storedCaret, this.host);
      }
    }

    window.addEventListener("beforeunload", () => {
      const { id } = this.routeService.getNoteConfigFromUrl();
      if (!id) return;
      const serializedPosition = this.caretService.serializePosition();
      if (!serializedPosition) return;
      sessionStorage.setItem(id.toString(), serializedPosition);
    });
  }

  async insertAtCaret(text: string) {
    await this.historyService.runAtomic(this.host, () => this.editService.caretPaste(text, this.host));
  }

  getSelectedText(): string | null {
    return this.caretService.getCaretContext()?.textSelected ?? null;
  }

  /**
   * @return is spellcheck enabled after toggling
   */
  toggleSpellcheck(forceState?: boolean): boolean {
    const newState = forceState === undefined ? !this.host.spellcheck : forceState;
    this.host.spellcheck = newState;
    this.preferencesService.updatePreferences({ spellcheck: newState });

    return newState;
  }

  async insertAtCaretWithContext(getInsertingContent: InsertFunction) {
    const caretContext = this.caretService.getCaretContext();
    if (!caretContext) {
      throw new Error("Cannot insert when caret does not exist");
    }

    const insertingContent = await getInsertingContent(caretContext);

    await this.historyService.runAtomic(this.host, () => this.editService.caretPaste(insertingContent, this.host));
  }

  async insertNoteLinkOnSave(openUrl: string) {
    this.remoteHostService.runOnNewNote(openUrl, (ev) => {
      const insertion = `[${ev.detail.title}](${ev.detail.id})`;
      this.insertAtCaret(insertion);
      this.notificationService.displayMessage(`Link inserted`);
    });
  }

  async linkToNoteOnSave(openUrl: string) {
    this.remoteHostService.runOnNewNote(openUrl, (ev) => {
      const id = ev.detail.id;
      this.insertAtCaretWithContext((context) => `[${context.textSelected}](${id})`);
      this.notificationService.displayMessage(`Link added`);
    });
  }
}
