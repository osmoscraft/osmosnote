import type { GetSystemInformationOutput } from "@osmoscraft/osmosnote";
import type { ApiService } from "../api/api.service";

interface FrontendInformation {
  clipboardEnabled: boolean;
  customElementEnabled: boolean;
  localStorageEnabled: boolean;
}

export class DiagnosticsService {
  private backendInformation: GetSystemInformationOutput["systemInformation"] | null = null;
  private frontendInformation: FrontendInformation | null = null;

  constructor(private apiService: ApiService) {}

  async init() {
    this.backendInformation = (await this.apiService.getSystemInformation())?.systemInformation;
    this.frontendInformation = this.collectFrontendDiagnostics();
    return this;
  }

  printToConsole() {
    console.log(`Frontend`, JSON.stringify(this.frontendInformation, null, 2));
    console.log(`Backend`, JSON.stringify(this.backendInformation, null, 2));
    return this;
  }

  private collectFrontendDiagnostics(): FrontendInformation {
    const clipboardEnabled = typeof window?.navigator?.clipboard?.writeText === "function";
    const customElementEnabled = typeof window?.customElements?.define === "function";
    const localStorageEnabled = typeof window?.localStorage?.setItem === "function";

    return {
      clipboardEnabled,
      customElementEnabled,
      localStorageEnabled,
    };
  }
}
