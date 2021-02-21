import { CommandBarComponent } from "./components/command-bar/command-bar.component.js";
import { StatusBarComponent } from "./components/status-bar/status-bar.component.js";
import { InputService } from "./components/text-editor/input.service.js";
import { TextEditorComponent } from "./components/text-editor/text-editor.component.js";
import { TextEditorService } from "./components/text-editor/text-editor.service.js";
import { ComponentRefService } from "./services/component-reference/component-ref.service.js";
import { HistoryService } from "./services/history/history.service.js";
import { NoteService } from "./services/note/note.service.js";
import { ProxyService } from "./services/proxy/proxy.service.js";
import { di } from "./utils/dependency-injector.js";

di.registerClass(ComponentRefService, []);
di.registerClass(HistoryService, []);
di.registerClass(ProxyService, []);
di.registerClass(NoteService, [HistoryService, ProxyService]);
di.registerClass(InputService, [HistoryService, NoteService, ComponentRefService]);
di.registerClass(TextEditorService, [NoteService, InputService]);

customElements.define("s2-command-bar", CommandBarComponent);
customElements.define("s2-text-editor", TextEditorComponent);
customElements.define("s2-status-bar", StatusBarComponent);
