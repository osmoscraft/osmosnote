import { createHandler } from "../lib/create-handler";
import { gitGetRemoteUrl } from "../lib/git";
import { getRepoMetadata } from "../lib/repo-metadata";

export interface GetSettingsInput {}

export interface GetSettingsOutput {
  remoteUrl: string | null;
}

export const handleGetSettings = createHandler<GetSettingsOutput, GetSettingsInput>(async (input) => {
  const config = await getRepoMetadata();
  const remoteUrl = await gitGetRemoteUrl(config.repoDir);

  return {
    remoteUrl,
  };
});
