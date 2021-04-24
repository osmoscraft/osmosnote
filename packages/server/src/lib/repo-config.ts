import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import { printDiagnosticsToConsole } from "./diagnostics";
import { execAsync } from "./exec-async";
import { getEnv } from "./get-env";

export interface RepoConfig {
  serverVersion: string;
  port: number;
  remoteUrl?: string;
}

const CONFIG_FILENAME = "osmosnote.json";

export async function ensureRepoConfig() {
  // Todo stop if there is no git
  await printDiagnosticsToConsole();

  // read environment variables
  const debugEnvPath = path.join(process.cwd(), ".env");
  if (debugEnvPath && fs.existsSync(debugEnvPath)) {
    console.log(`[config] .env override ${debugEnvPath}`);
    const configResult = dotenv.config({ path: debugEnvPath });
    if (configResult.error) {
      console.error(`[config] .env contains error`, configResult.error);
      process.exit(1);
    }
  }

  const env = getEnv();

  // ensure repo dir
  const repoDir = env.OSMOSNOTE_REPO_DIR;
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

  // ensure repo config file
  const configFilePath = path.join(repoDir, CONFIG_FILENAME);
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

  // ensure repo dir is managed by git
  const dotGit = path.join(env.OSMOSNOTE_REPO_DIR!, ".git");
  if (!fs.existsSync(dotGit)) {
    console.log(`[config] ${repoDir} is not a git repo. Initializing...`);
    try {
      const initResult = await execAsync("git init", { cwd: repoDir });
      if (initResult.stderr) {
        console.log(initResult.stderr);
      }
    } catch (error) {
      console.error(`[config] error initialize git at ${repoDir}`, error);
    }
  }

  console.log(`[config] system ready at ${repoDir}`);
}

export async function getRepoConfig(): Promise<RepoConfig> {
  const env = getEnv();
  const repoDir = env.OSMOSNOTE_REPO_DIR!;
  const configFilePath = path.join(repoDir, CONFIG_FILENAME);

  try {
    return await fs.readJSON(configFilePath);
  } catch (error) {
    console.error(`[config] error getting repo config ${configFilePath}`);
    throw error;
  }
}
