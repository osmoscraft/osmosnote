import { createHandler } from "../lib/create-handler";
import { getRepoConfig, RepoConfig } from "../lib/repo-config";

export interface GetSettingsInput {}

export interface GetSettingsOutput {
  repoConfig: RepoConfig;
}

export const handleGetSettings = createHandler<GetSettingsOutput, GetSettingsInput>(async (input) => {
  const repoConfig = await getRepoConfig();

  return {
    repoConfig,
  };
});
