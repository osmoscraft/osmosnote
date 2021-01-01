import type { VersionsBody, VersionsReply } from "@system-two/server/src/routes/versions";
import type { ProxyService } from "../proxy/proxy.service";

export class SourceControlService {
  constructor(private proxyService: ProxyService) {}

  async check() {
    const versionsBody: VersionsBody = {
      action: "check",
    };

    return this.proxyService.post<VersionsReply, VersionsBody>(`/api/versions`, versionsBody);
  }

  async sync() {
    const versionsBody: VersionsBody = {
      action: "sync",
    };

    return this.proxyService.post<VersionsReply, VersionsBody>(`/api/versions`, versionsBody);
  }
}
