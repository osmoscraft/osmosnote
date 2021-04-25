import { ApiService } from "../../services/api/api.service.js";
import { di } from "../../utils/dependency-injector.js";

export class SettingsFormComponent extends HTMLElement {
  private formDom!: HTMLFormElement;
  private apiService!: ApiService;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <form id="admin-settings" onsubmit="return false;">
    <fieldset>
      <legend>Storage backend</legend>
      <label><input name="storageBackend" value="github" type="radio">GitHub </label>
      <label><input name="storageBackend" value="custom" type="radio">Custom</label>
    </fieldset>
    <fieldset>
      <legend>GitHub settings</legend>
      <label for="github-repo">Repo</label>
      <input id="github-repo" name="githubRepo" type="text" required>
      <label for="github-owner">Owner</label>
      <input id="github-owner" name="githubRepo" type="text" required>
      <label for="github-token">Personal access token</label>
      <input id="github-token" name="githubRepo" type="password" required>
    </fieldset>
    <fieldset>
      <legend>Custom settings</legend>
      <label for="custom-remote-url">Remote URL</label>
      <input id="custom-remote-url" name="customRemoteUrl" type="url" required>
    </fieldset>
    <button type="button">Save</button>
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
