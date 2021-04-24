import { ApiService } from "../../services/api/api.service.js";
import { di } from "../../utils/dependency-injector.js";

export class AdminSettingsComponent extends HTMLElement {
  private formDom!: HTMLFormElement;
  private apiService!: ApiService;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <form id="admin-settings" onsubmit="return false;">
    <fieldset>
      <legend>Interface</legend>
      <label for="spellcheck">Check spelling</label>
      <input id="spellcheck" name="spellcheck" type="checkbox">
    </fieldset>
    <fieldset>
      <legend>Storage</legend>
      <label for="remote-url">Remote URL</label>
      <input id="remote-url" name="remoteUrl" type="url" required>
    </fieldset>
    <button type="button">Save</button>
  </form>`;

    this.apiService = di.getSingleton(ApiService);
    this.formDom = this.querySelector("#admin-settings")!;

    this.loadData();
    this.handleEvents();
  }

  private async loadData() {}
  private handleEvents() {}
}
