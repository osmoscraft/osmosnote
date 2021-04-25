import { getEnv } from "./get-env";
import { getRepoConfig, RepoConfig } from "./repo-config";

export interface RepoMetadata {
  repoDir: string;
  repoConfig: RepoConfig;
}

export async function getRepoMetadata(): Promise<RepoMetadata> {
  try {
    const repoConfig = await getRepoConfig();
    const env = getEnv();

    const appConfig = {
      repoDir: env.OSMOSNOTE_REPO_DIR!,
      repoConfig,
    };

    return appConfig;
  } catch (error) {
    console.error(`[config] error getting app config`);
    throw error;
  }
}
