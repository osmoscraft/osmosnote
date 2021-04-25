import { getAppEnv } from "./get-env";

export interface RepoMetadata {
  repoDir: string;
  port: number;
}

export async function getRepoMetadata(): Promise<RepoMetadata> {
  try {
    const env = getAppEnv();
    const port = env.OSMOSNOTE_SERVER_PORT;

    const appConfig = {
      repoDir: env.OSMOSNOTE_REPO_DIR!,
      port,
    };

    return appConfig;
  } catch (error) {
    console.error(`[config] error getting app config`);
    throw error;
  }
}
