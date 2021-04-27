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
  private testButton!: HTMLButtonElement;
  private importButton!: HTMLButtonElement;
  private exportButton!: HTMLButtonElement;
  private formStatusContainer!: HTMLFieldSetElement;
  private formStatusOuput!: HTMLOutputElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <form id="settings-form" spellcheck="false">

      <fieldset class="form-fieldset">
        <legend>Git hosting</legend>
        <div class="form-fields">
          <div class="form-field">
            <div class="form-field__control option-set">
              <label class="option-label"><input type="radio" name="hostingProvider" value="github"><span>GitHub</span></label>
              <label class="option-label"><input type="radio" name="hostingProvider" value="custom"><span>Custom</span></label>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="form-fieldset" data-if-hosting-provider="github">
        <legend>GitHub connection</legend>
        <div class="form-fields">
          <div class="form-field">
            <label class="form-field__label" for="git-owner">Owner</label>
            <input class="form-field__control" id="git-owner" name="owner" type="text" placeholder="Username or organization" required>
          </div>
          <div class="form-field">
            <label class="form-field__label" for="git-repo">Repo</label>
            <input class="form-field__control" id="git-repo" name="repo" type="text" required>
          </div>
          <div class="form-field">
            <span class="form-field__label">Network protocol</span>
            <div class="form-field__control option-set">
              <label class="option-label"><input type="radio" name="networkProtocol" value="https">HTTPS</label>
              <label class="option-label"><input type="radio" name="networkProtocol" value="ssh">SSH</label>
            </div>
          </div>
          <div data-if-network-protocol="https" class="form-field">
            <label class="form-field__label" for="git-token">Personal access token</label><a class="form-field__action" href="https://github.com/settings/tokens/new">Create</a>
            <input id="git-token" class="form-field__control" name="accessToken" type="password" placeholder="e.g. ghp_ABCDEFGHIKLMNN1234567890abcdefhijklm" required>
          </div>
        </div>
      </fieldset>

      <fieldset class="form-fieldset" data-if-hosting-provider="custom">
        <legend>Custom connection</legend>
          <div class="form-field">
            <label class="form-field__label" for="custom-origin">Origin</label>
            <input id="custom-origin" class="form-field__control" name="customOrigin" type="text" required>
          </div>
          <p>Examples</p>
          <ul>
            <li><samp><kbd>https://&lt;token_name>:&lt;token_value>@gitlab.com/&lt;owner>/&lt;repo>.git</kbd></samp></li>
            <li><samp><kbd>ssh://git@gitlab.com:&lt;owner>/&lt;repo>.git</kbd></samp></li>
            <li><samp><kbd>git@gitlab.com:&lt;owner>/&lt;repo>.git</kbd></samp></li>
          </ul>
        </div>
      </fieldset>

      <fieldset id="form-status-container" class="form-status-container" role="presentation">
        <legend>Status</legend>
        <output class="form-status-output" id="form-status-output" role="status" aria-live="polite"></output>
      </fieldset>
      
      <div>
        <button class="btn--box btn--neutral" type="submit" id="save">Save connection</button>
        <button class="btn--box btn--neutral" type="button" id="test-connection">Test</button>
        <details class="danger-zone">
          <summary class="details__label">Danger zone</summary>
          <div class="danger-sections">
          <section class="danger-section">
            <h1 class="danger-title">Import from remote</h1>
            <p class="danger-description">Wipe out content from your local machine, then initialize it with content from the remote host.<br>It is equivalent to <code><kbd>git fetch && git reset --hard origin/main</kbd></code>.</p>
            <button class="btn--box btn--danger" type="button" id="import-remote">Import</button>
          </section>
          <section class="danger-section">
            <h1 class="danger-title">Export to remote</h1>
            <p class="danger-description">Wipe out content from your remote host, then initialize it with content from your local machine.<br>It is equivalent to <code><kbd>git push --force</kbd></code>.</p>
            <button class="btn--box btn--danger" type="button" id="export-remote">Export</button>
          </section>
          </div>
        </details>
      </div>
    </form>`;

    this.apiService = di.getSingleton(ApiService);
    this.formDom = this.querySelector("#settings-form")!;
    this.ownerInput = this.formDom.querySelector(`input[name="owner"]`)!;
    this.repoInput = this.formDom.querySelector(`input[name="repo"]`)!;
    this.accessTokenInput = this.formDom.querySelector(`input[name="accessToken"]`)!;
    this.customOriginInput = this.formDom.querySelector(`input[name="customOrigin"]`)!;
    this.saveButton = this.formDom.querySelector(`#save`)!;
    this.testButton = this.formDom.querySelector(`#test-connection`)!;
    this.importButton = this.formDom.querySelector(`#import-remote`)!;
    this.exportButton = this.formDom.querySelector(`#export-remote`)!;
    this.formStatusOuput = this.formDom.querySelector(`#form-status-output`)!;
    this.formStatusContainer = this.formDom.querySelector(`#form-status-container`)!;

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

    this.saveButton.addEventListener("click", (e) => this.save());
    this.testButton.addEventListener("click", (e) => this.test());
    this.importButton.addEventListener("click", (e) => this.import());
    this.exportButton.addEventListener("click", (e) => this.export());
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

  private async save() {
    if (!this.formDom.checkValidity()) {
      this.formDom.reportValidity();
      return;
    }

    const model = this.getModelFromDom();
    const originUrl = this.getOriginUrlFromModel(model);

    this.formStatusOuput.innerText = "Saving…";
    this.formStatusContainer.dataset.active = "";
    const result = await this.apiService.setGitRemote(originUrl);
    if (result.success) {
      this.formStatusOuput.innerText = "Success!";
    } else {
      this.formStatusOuput.innerText = result.message ?? "Unknown error";
    }
  }

  private async test() {
    if (!this.formDom.checkValidity()) {
      this.formDom.reportValidity();
      return;
    }

    const model = this.getModelFromDom();
    const originUrl = this.getOriginUrlFromModel(model);

    this.formStatusOuput.innerText = "Testing…";
    this.formStatusContainer.dataset.active = "";

    const result = await this.apiService.testGitRemote(originUrl);
    if (result.success) {
      this.formStatusOuput.innerText = "Success!";
    } else {
      this.formStatusOuput.innerText = result.message ?? "Unknown error";
    }
  }

  private async import() {
    if (!this.formDom.checkValidity()) {
      this.formDom.reportValidity();
      return;
    }

    const model = this.getModelFromDom();
    const originUrl = this.getOriginUrlFromModel(model);

    if (
      !window.confirm(
        `Any existing content on your local machine will be wiped out.\nAre you sure you want to import from:\n\n${model.owner}\\${model.repo}?`
      )
    )
      return;

    this.formStatusOuput.innerText = "Saving…";
    this.formStatusContainer.dataset.active = "";
    const saveResult = await this.apiService.setGitRemote(originUrl);

    if (!saveResult.success) {
      this.formStatusOuput.innerText = saveResult.message ?? "Unknown error saving";
      return;
    }

    this.formStatusOuput.innerText = "Importing…";
    const resetResult = await this.apiService.resetLocalVersion();

    if (!resetResult.success) {
      this.formStatusOuput.innerText = resetResult.message ?? "Unknown error importing";
      return;
    }

    this.formStatusOuput.innerText = "Success!";
  }

  private async export() {
    if (!this.formDom.checkValidity()) {
      this.formDom.reportValidity();
      return;
    }

    const model = this.getModelFromDom();
    const originUrl = this.getOriginUrlFromModel(model);

    if (
      !window.confirm(
        `Any existing content on the remote will be wiped out.\nAre you sure you want to export to:\n\n${model.owner}\\${model.repo}?`
      )
    )
      return;

    this.formStatusOuput.innerText = "Saving…";
    this.formStatusContainer.dataset.active = "";
    const saveResult = await this.apiService.setGitRemote(originUrl);

    if (!saveResult.success) {
      this.formStatusOuput.innerText = saveResult.message ?? "Unknown error saving";
      return;
    }

    this.formStatusOuput.innerText = "Exporting…";
    const pushResult = await this.apiService.forcePush();

    if (!pushResult.success) {
      this.formStatusOuput.innerText = pushResult.message ?? "Unknown error exporting";
      return;
    }

    this.formStatusOuput.innerText = "Success!";
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

  private getOriginUrlFromModel(model: SettingsModel) {
    let originUrl = "";
    if (model.hostingProvider === "custom") {
      originUrl = model.customOrigin;
    } else {
      // github
      if (model.networkProtocol === "ssh") {
        // github ssh
        originUrl = `git@github.com:${model.owner}/${model.repo}.git`;
      } else {
        // github https (token is required)
        originUrl = `https://${model.owner}:${model.accessToken}@github.com/${model.owner}/${model.repo}.git`;
      }
    }

    return originUrl;
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
