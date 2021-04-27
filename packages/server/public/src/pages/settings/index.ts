import { SettingsFormComponent } from "../../components/settings-form/settings-form.component.js";
import { ApiService } from "../../services/api/api.service.js";
import { DiagnosticsService } from "../../services/diagnostics/diagnostics-service.js";
import { QueryService } from "../../services/query/query.service.js";
import { di } from "../../utils/dependency-injector.js";

di.registerClass(QueryService, []);
di.registerClass(ApiService, [QueryService]);
di.registerClass(DiagnosticsService, [ApiService]);

// Do this as early as possible
const diagnostics = di.getSingleton(DiagnosticsService);
(async () => {
  (await diagnostics.init()).printToConsole();
})();

customElements.define("s2-settings-form", SettingsFormComponent);
