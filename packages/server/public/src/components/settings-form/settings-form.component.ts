import { ApiService } from "../../services/api/api.service.js";
import { di } from "../../utils/dependency-injector.js";

export class SettingsFormComponent extends HTMLElement {
  private formDom!: HTMLFormElement;
  private apiService!: ApiService;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <form id="admin-settings" onsubmit="return false;">
    <fieldset>
      <legend>Storage</legend>
      <label for="remote-url">Remote URL</label>
      <input id="remote-url" name="remoteUrl" type="url" required>
      <button type="button">Save</button>
    </fieldset>
  </form>`;

    this.apiService = di.getSingleton(ApiService);
    this.formDom = this.querySelector("#admin-settings")!;

    this.loadData();
    this.handleEvents();
  }

  private async loadData() {
    const settings = await this.apiService.getSettings();
    console.dir(settings.repoConfig);
  }
  private handleEvents() {}
}
