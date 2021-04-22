import { getRepoConfig } from "./repo-config";

export interface AppConfig {
  notesDir: string;
  port: number;
}

const DEFAULT_PORT = 2077;

export async function getAppConfig(): Promise<AppConfig> {
  try {
    const repoConfig = await getRepoConfig();

    const appConfig = {
      notesDir: process.env.OSMOSNOTE_REPO_DIR!,
      port: repoConfig.port ?? DEFAULT_PORT,
    };

    return appConfig;
  } catch (error) {
    console.error(`[config] error getting app config`);
    throw error;
  }
}
