import type { ApiService } from "../../services/api/api.service";
import type { ComponentRefService } from "../../services/component-reference/component-ref.service";
import type { DocumentRefService } from "../../services/document-reference/document.service";
import type { NotificationService } from "../../services/notification/notification.service";
import type { RemoteClientService } from "../../services/remote/remote-client.service";
import type { RouteService } from "../../services/route/route.service";
import type { WindowRefService } from "../../services/window-reference/window.service";
import type { CompileService } from "./compiler/compile.service";
import type { HistoryService } from "./history/history.service";
import type { TrackChangeService } from "./track-change.service";

export class SyncService {
  constructor(
    private apiService: ApiService,
    private historyService: HistoryService,
    private trackChangeService: TrackChangeService,
    private notificationService: NotificationService,
    private remoteClientService: RemoteClientService,
    private componentRefs: ComponentRefService,
    private formatService: CompileService,
    private routeService: RouteService,
    private windowRef: WindowRefService,
    private documentRef: DocumentRefService
  ) {}

  async saveFile() {
    const host = this.componentRefs.textEditor.host;
    this.formatService.compile(host);
    const lines = [...host.querySelectorAll("[data-line]")] as HTMLElement[];
    const note = this.formatService.getPortableText(lines);
    // TODO ensure any required metadata fields, e.g. title and ctime

    const { id } = this.routeService.getNoteConfigFromUrl();

    try {
      if (id) {
        this.trackChangeService.set(this.historyService.peek()!.textContent, false);
        this.historyService.save(host);
        const result = await this.apiService.updateNote(id, note);

        this.documentRef.document.title = result.title;
      } else {
        this.trackChangeService.set(this.historyService.peek()!.textContent, false, false);
        const result = await this.apiService.createNote(note);
        this.remoteClientService.notifyNoteCreated({ id: result.id, title: result.title });
        this.windowRef.window.history.replaceState(null, result.title, `/?id=${result.id}`);

        this.documentRef.document.title = result.title;
      }

      this.notificationService.displayMessage("Saved");
    } catch (error) {
      this.notificationService.displayMessage("Error saving note");
    }
  }

  async checkAllFileVersions() {
    this.notificationService.displayMessage("Checking…");

    try {
      const result = await this.apiService.getVersionStatus();
      if (result.isUpToDate) {
        this.notificationService.displayMessage(result.message);
      } else {
        this.notificationService.displayMessage(result.message, "warning");
      }
    } catch (error) {
      this.componentRefs.statusBar.setMessage("Error checking version", "error");
    }
  }

  async syncAllFileVersions() {
    this.componentRefs.statusBar.setMessage("Sync…");

    try {
      const result = await this.apiService.syncVersions();
      this.componentRefs.statusBar.setMessage(result.message);
    } catch (error) {
      this.componentRefs.statusBar.setMessage("Error syncing versions", "error");
    }
  }
}
