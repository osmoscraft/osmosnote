import { CommandBarComponent } from "./components/command-bar/command-bar.component.js";
import { TextEditorComponent } from "./components/text-editor/text-editor.component.js";
import { TextEditorService } from "./components/text-editor/text-editor.service.js";
import { ComponentReferenceService } from "./services/component-reference/component-reference.service.js";
import { HistoryService } from "./services/history/history.service.js";
import { InputService } from "./services/input/input.service.js";
import { NoteService } from "./services/note/note.service.js";
import { ProxyService } from "./services/proxy/proxy.service.js";
import { di } from "./utils/dependency-injector.js";

di.registerClass(ComponentReferenceService, []);
di.registerClass(HistoryService, []);
di.registerClass(ProxyService, []);
di.registerClass(NoteService, [HistoryService, ProxyService]);
di.registerClass(InputService, [HistoryService, NoteService]);
di.registerClass(TextEditorService, [NoteService, InputService]);

customElements.define("s2-command-bar", CommandBarComponent);
customElements.define("s2-text-editor", TextEditorComponent);
