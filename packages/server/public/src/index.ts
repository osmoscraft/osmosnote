import { CommandBarComponent } from "./components/command-bar/command-bar.component.js";
import { ReferencePanelComponent } from "./components/reference-panel/reference-panel.component.js";
import { StatusBarComponent } from "./components/status-bar/status-bar.component.js";
import { InputService } from "./components/text-editor/input.service.js";
import { TextEditorComponent } from "./components/text-editor/text-editor.component.js";
import { ComponentRefService } from "./services/component-reference/component-ref.service.js";
import { HistoryService } from "./components/text-editor/history/history.service.js";
import { ApiService } from "./services/api/api.service.js";
import { NotificationService } from "./services/notification/notification.service.js";
import { QueryService } from "./services/query/query.service.js";
import { RouteService } from "./services/route/route.service.js";
import { di } from "./utils/dependency-injector.js";
import { RemoteHostService } from "./services/remote/remote-host.service.js";
import { RemoteClientService } from "./services/remote/remote-client.service.js";
import { CaretService } from "./components/text-editor/caret.service.js";
import { WindowRefService } from "./services/window-reference/window.service.js";
import { EditService } from "./components/text-editor/edit.service.js";
import { CompileService } from "./components/text-editor/compiler/compile.service.js";
import { LineQueryService } from "./components/text-editor/line-query.service.js";
import { MeasureService } from "./components/text-editor/measure.service.js";
import { TrackChangeService } from "./components/text-editor/track-change.service.js";
import { SyncService } from "./components/text-editor/sync.service.js";
import { PreferencesService } from "./services/preferences/preferences.service.js";

di.registerClass(ComponentRefService, []);
di.registerClass(QueryService, []);
di.registerClass(RouteService, []);
di.registerClass(NotificationService, [ComponentRefService]);
di.registerClass(ApiService, [QueryService]);
di.registerClass(WindowRefService, []);
di.registerClass(PreferencesService, [WindowRefService]);
di.registerClass(MeasureService, [WindowRefService]);
di.registerClass(LineQueryService, [MeasureService]);
di.registerClass(CaretService, [ComponentRefService, WindowRefService, LineQueryService]);
di.registerClass(HistoryService, [CaretService, LineQueryService, TrackChangeService]);
di.registerClass(CompileService, [CaretService, LineQueryService]);
di.registerClass(EditService, [CaretService, CompileService, LineQueryService, CompileService]);
di.registerClass(InputService, [
  CaretService,
  EditService,
  LineQueryService,
  HistoryService,
  TrackChangeService,
  ComponentRefService,
  WindowRefService,
]);
di.registerClass(RemoteHostService, [ComponentRefService]);
di.registerClass(TrackChangeService, [NotificationService, WindowRefService]);
di.registerClass(RemoteClientService, []);
di.registerClass(SyncService, [
  ApiService,
  HistoryService,
  TrackChangeService,
  NotificationService,
  RemoteClientService,
  ComponentRefService,
  CompileService,
  RouteService,
]);

customElements.define("s2-command-bar", CommandBarComponent);
customElements.define("s2-status-bar", StatusBarComponent);
customElements.define("s2-text-editor", TextEditorComponent);
customElements.define("s2-reference-panel", ReferencePanelComponent);
