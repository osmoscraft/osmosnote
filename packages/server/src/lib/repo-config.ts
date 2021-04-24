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
const DEFAULT_PORT = 6683; // "NOTE" on a T9 keyboard

export async function ensureRepoConfig() {
  // Todo stop if there is no git
  await printDiagnosticsToConsole();

  // read environment variables
  const debugEnvPath = path.join(process.cwd(), ".env");
  if (debugEnvPath && fs.existsSync(debugEnvPath)) {
    console.log(`[config] Using dotenv ${debugEnvPath}`);
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
    console.error(`[config] Environment variable OSMOSNOTE_REPO_DIR must be set`);
    process.exit(1);
  }

  if (!fs.existsSync(repoDir)) {
    console.log(`[config] Creating dir ${repoDir}`);
    try {
      fs.ensureDirSync(repoDir);
    } catch (error) {
      console.error(`[config] Error creating repo directory ${repoDir}`, error);
      process.exit(1);
    }
  }

  // ensure repo config file
  const configFilePath = path.join(repoDir, CONFIG_FILENAME);
  if (!fs.existsSync(configFilePath)) {
    console.log(`[config] Creating config ${configFilePath}`);
    try {
      fs.writeJSONSync(
        configFilePath,
        {
          port: DEFAULT_PORT,
        },
        { spaces: 2 }
      );
    } catch (error) {
      console.error(`[config] Error creating config file ${configFilePath}`, error);
      process.exit(1);
    }
  }

  // Git ignore config file (it will contain access token)
  const dotGitIgnore = path.join(env.OSMOSNOTE_REPO_DIR!, ".gitignore");
  if (!fs.existsSync(dotGitIgnore)) {
    console.log(`[config] Initializing gitignore ${dotGitIgnore}`);
    try {
      fs.writeFileSync(dotGitIgnore, `${CONFIG_FILENAME}\n`);
    } catch (error) {
      console.error(`[config] Error creating .gitnore ${dotGitIgnore}`);
      process.exit(1);
    }
  }

  // ensure repo dir is managed by git
  const dotGit = path.join(env.OSMOSNOTE_REPO_DIR!, ".git");
  if (!fs.existsSync(dotGit)) {
    console.log(`[config] Initializing git ${repoDir}`);
    try {
      const initResult = await execAsync("git init", { cwd: repoDir });
      if (initResult.stderr) {
        console.log(initResult.stderr);
      }
    } catch (error) {
      console.error(`[config] Error initialize git at ${repoDir}`, error);
      process.exit(1);
    }
  }

  console.log(`[config] System ready ${repoDir}`);
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
