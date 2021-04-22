import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import { printDiagnosticsToConsole } from "./diagnostics";

export interface RepoConfig {
  serverVersion: string;
  port: number;
  remoteUrl?: string;
}

const CONFIG_FILENAME = "osmosnote.json";

export async function ensureRepoConfig() {
  await printDiagnosticsToConsole();

  const debugEnvPath = path.resolve(process.cwd(), ".env");
  if (debugEnvPath && fs.existsSync(debugEnvPath)) {
    console.log(`[config] .env found ${debugEnvPath}`);
    const configResult = dotenv.config({ path: debugEnvPath });
    if (configResult.error) {
      console.error(`[config] .env contains error`, configResult.error);
      process.exit(1);
    }
  }

  const repoDir = process.env.OSMOSNOTE_REPO_DIR;
  if (!repoDir) {
    console.error(`[config] environment variable OSMOSNOTE_REPO_DIR is not set`);
    process.exit(1);
  }

  if (!fs.existsSync(repoDir)) {
    console.log(`[config] repo directory missing at ${repoDir}. Creating...`);
    try {
      fs.ensureDirSync(repoDir);
    } catch (error) {
      console.error(`[config] error creating repo directory ${repoDir}`, error);
      process.exit(1);
    }
  }

  const configFilePath = path.resolve(repoDir, CONFIG_FILENAME);
  if (!fs.existsSync(configFilePath)) {
    console.log(`[config] config file missing at ${configFilePath}. Creating...`);
    try {
      fs.writeJSONSync(
        configFilePath,
        {
          port: 2077,
        },
        { spaces: 2 }
      );
    } catch (error) {
      console.error(`[config] error creating config file ${configFilePath}`, error);
    }
  }

  console.log(`[config] config file ready at ${configFilePath}`);
}

export async function getRepoConfig(): Promise<RepoConfig> {
  const repoDir = process.env.OSMOSNOTE_REPO_DIR!;
  const configFilePath = path.resolve(repoDir, CONFIG_FILENAME);

  try {
    return await fs.readJSON(configFilePath);
  } catch (error) {
    console.error(`[config] error getting repo config ${configFilePath}`);
    throw error;
  }
}
