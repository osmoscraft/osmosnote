import { ApiService } from "../../services/api/api.service.js";
import { di } from "../../utils/dependency-injector.js";

interface SettingsModel {
  hostingProvider: "github" | "custom";
  networkProtocol: "ssh" | "https";
  owner: string;
  repo: string;
  accessToken: string;
  customOrigin: string;
}

export class SettingsFormComponent extends HTMLElement {
  private formDom!: HTMLFormElement;
  private ownerInput!: HTMLInputElement;
  private repoInput!: HTMLInputElement;
  private accessTokenInput!: HTMLInputElement;
  private customOriginInput!: HTMLInputElement;
  private apiService!: ApiService;
  private saveButton!: HTMLButtonElement;
  private testConnectionButton!: HTMLButtonElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <form id="settings-form">

    <fieldset>
      <legend>Git hosting</legend>
      <div class="form-fields">
        <div class="form-field">
          <label><input type="radio" name="hostingProvider" value="github">GitHub<label/>
          <label><input type="radio" name="hostingProvider" value="custom">Custom<label/>
        </div>
      </div>
    </fieldset>

    <fieldset data-if-hosting-provider="github">
      <legend>GitHub connection</legend>
      <div class="form-fields">
        <div class="form-field">
          <label class="form-field__label" for="git-owner">Owner</label>
          <input id="git-owner" name="owner" type="text" placeholder="Username or organization" required>
        </div>
        <div class="form-field">
          <label class="form-field__label" for="git-repo">Repo</label>
          <input id="git-repo" name="repo" type="text" required>
        </div>
        <div class="form-field">
          <span class="form-field__label">Network protocol</span>
          <label><input type="radio" name="networkProtocol" value="https">HTTPS<label/>
          <label><input type="radio" name="networkProtocol" value="ssh">SSH<label/>
        </div>
        <div data-if-network-protocol="https" class="form-field">
          <label class="form-field__label" for="git-token">Personal access token</label>
          <input id="git-token" name="accessToken" type="password">
        </div>
      </div>
    </fieldset>



    <fieldset data-if-hosting-provider="custom">
      <legend>Custom connection</legend>
        <div class="form-field">
          <label class="form-field__label" for="custom-origin">Origin</label>
          <input id="custom-origin" name="customOrigin" type="text" required>
        </div>
        <p>Origins examples</p>
        <ul>
          <li><samp><kbd>https://&lt;token_name>:&lt;token_value>@gitlab.com/&lt;owner>/&lt;repo>.git</kbd></samp></li>
          <li><samp><kbd>ssh://git@gitlab.com:&lt;owner>/&lt;repo>.git</kbd></samp></li>
          <li><samp><kbd>git@gitlab.com:&lt;owner>/&lt;repo>.git</kbd></samp></li>
        </ul>
      </div>
    </fieldset>

    <button type="submit" id="save">Save</button>
    <button type="button" id="test-connection">Test connection</button>
  </form>`;

    this.apiService = di.getSingleton(ApiService);
    this.formDom = this.querySelector("#settings-form")!;
    this.ownerInput = this.formDom.querySelector(`input[name="owner"]`)!;
    this.repoInput = this.formDom.querySelector(`input[name="repo"]`)!;
    this.accessTokenInput = this.formDom.querySelector(`input[name="accessToken"]`)!;
    this.customOriginInput = this.formDom.querySelector(`input[name="customOrigin"]`)!;
    this.saveButton = this.formDom.querySelector(`#save`)!;
    this.testConnectionButton = this.formDom.querySelector(`#test-connection`)!;

    this.loadData();
    this.handleEvents();
  }

  private handleEvents() {
    this.formDom.addEventListener("change", (e) => {
      const model = this.getModelFromDom();
      this.render(model);
    });

    this.formDom.addEventListener("submit", (e) => {
      e.preventDefault();
    });

    this.saveButton.addEventListener("click", (e) => {});

    this.testConnectionButton.addEventListener("click", (e) => this.testConnection());
  }

  private async loadData() {
    const settings = await this.apiService.getSettings();
    const model = settings.remoteUrl ? this.parseRemote(settings.remoteUrl) : this.getDefaultModel();
    this.render(model);
  }

  private getModelFromDom(): SettingsModel {
    const formData = new FormData(this.formDom);
    const model = (Object.fromEntries(formData.entries()) as any) as SettingsModel;
    // For any input that can be disabled, get its value from DOM instead
    model.accessToken = this.accessTokenInput.value;
    model.owner = this.ownerInput.value;
    model.repo = this.repoInput.value;
    model.customOrigin = this.customOriginInput.value;

    return model;
  }

  private render(model: SettingsModel) {
    // hosting provider
    this.formDom.querySelector<HTMLInputElement>(
      `input[name="hostingProvider"][value="${model.hostingProvider}"]`
    )!.checked = true;

    this.formDom.querySelectorAll<HTMLElement>(`[data-if-hosting-provider]`).forEach((element) => {
      const isActive = element.dataset.ifHostingProvider === model.hostingProvider;
      this.toggleFormSectionVisibility(element, isActive);
    });

    // owner, repo, access token
    this.ownerInput.value = model.owner;
    this.repoInput.value = model.repo;
    this.accessTokenInput.value = model.accessToken;

    // network protocol
    (this.formDom.querySelector(
      `input[name="networkProtocol"][value="${model.networkProtocol}"]`
    ) as HTMLInputElement).checked = true;

    this.formDom.querySelectorAll<HTMLElement>(`[data-if-network-protocol]`).forEach((element) => {
      const isActive = element.dataset.ifNetworkProtocol === model.networkProtocol;
      this.toggleFormSectionVisibility(element, isActive);
    });

    // custom origin
    this.customOriginInput.value = model.customOrigin;
  }

  private toggleFormSectionVisibility(element: HTMLElement, condition: boolean) {
    if (condition) {
      element.querySelectorAll<HTMLInputElement>("input[required]").forEach((element) => (element.disabled = false));
      element.dataset.active = "";
    } else {
      element.querySelectorAll<HTMLInputElement>("input[required]").forEach((element) => (element.disabled = true));
      delete element.dataset.active;
    }
  }

  private testConnection() {
    if (!this.formDom.checkValidity()) {
      this.formDom.reportValidity();
      return;
    }

    const model = this.getModelFromDom();
    let originUrl = "";
    if (model.hostingProvider === "custom") {
      originUrl = model.customOrigin;
    } else {
      // github
      if (model.networkProtocol === "ssh") {
        // github ssh
        originUrl = `git@github.com:${model.owner}/${model.repo}.git`;
      } else {
        // github https
        if (model.accessToken) {
          originUrl = `https://${model.owner}:${model.accessToken}@github.com/${model.owner}/${model.repo}.git`;
        } else {
          originUrl = `https://github.com/${model.owner}/${model.repo}.git`;
        }
      }
    }
  }

  private getDefaultModel(): SettingsModel {
    return {
      hostingProvider: "github",
      networkProtocol: "https",
      owner: "",
      repo: "",
      accessToken: "",
      customOrigin: "",
    };
  }

  /**
   * GitHub parser supports:
   *
   * GitHub
   * https://<owner>:<token>@github.com/<owner>/<repo>.git
   * https://github.com/<owner>/<repo>.git
   * git@github.com:<owner>/<repo>.git
   *
   * Custom (including GitLab):
   *
   * https://<token_name>:<token_value>@gitlab.com/<owner>/<repo>.git
   * git@gitlab.com:<owner>/<repo>.git
   *
   *
   */
  private parseRemote(url: string): SettingsModel {
    const hostingProvider = url.includes("github.com") ? "github" : "custom";
    const networkProtocol = url.startsWith("https://") ? "https" : "ssh";
    const pattern = /(:|\/)([^/]+)\/([^/]+).git/;
    const matchResult = url.match(pattern);

    let raw,
      _,
      owner = "",
      repo = "",
      accessToken = "";

    if (matchResult) {
      [raw, _, owner, repo] = matchResult;
    }

    if (hostingProvider === "github" && networkProtocol === "https") {
      const tokenMatchResult = url.match(/https:\/\/(.+):(.+)@/);
      if (tokenMatchResult) {
        [raw, _, accessToken] = tokenMatchResult;
      }
    }

    return {
      hostingProvider,
      networkProtocol,
      owner,
      repo,
      accessToken,
      customOrigin: url.trim(),
    };
  }
}
