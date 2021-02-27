import { CommandBarComponent } from "./components/command-bar/command-bar.component.js";
import { ReferencePanelComponent } from "./components/reference-panel/reference-panel.component.js";
import { StatusBarComponent } from "./components/status-bar/status-bar.component.js";
import { InputService } from "./components/text-editor/input.service.js";
import { TextEditorComponent } from "./components/text-editor/text-editor.component.js";
import { ComponentRefService } from "./services/component-reference/component-ref.service.js";
import { HistoryService } from "./services/history/history.service.js";
import { ApiService } from "./services/api/api.service.js";
import { NotificationService } from "./services/notification/notification.service.js";
import { QueryService } from "./services/query/query.service.js";
import { RouteService } from "./services/route/route.service.js";
import { di } from "./utils/dependency-injector.js";
import { RemoteHostService } from "./services/remote/remote-host.service.js";
import { RemoteClientService } from "./services/remote/remote-client.service.js";
import { CaretService } from "./components/text-editor/caret.service.js";

di.registerClass(ComponentRefService, []);
di.registerClass(HistoryService, []);
di.registerClass(QueryService, []);
di.registerClass(RouteService, []);
di.registerClass(NotificationService, [ComponentRefService]);
di.registerClass(ApiService, [QueryService]);
di.registerClass(CaretService, [ComponentRefService]);
di.registerClass(InputService, [
  CaretService,
  HistoryService,
  ApiService,
  RouteService,
  NotificationService,
  ComponentRefService,
]);
di.registerClass(RemoteHostService, [ComponentRefService]);
di.registerClass(RemoteClientService, []);

customElements.define("s2-command-bar", CommandBarComponent);
customElements.define("s2-text-editor", TextEditorComponent);
customElements.define("s2-status-bar", StatusBarComponent);
customElements.define("s2-reference-panel", ReferencePanelComponent);
