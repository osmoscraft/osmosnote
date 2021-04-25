import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import { printDiagnosticsToConsole } from "./diagnostics";
import { execAsync } from "./exec-async";
import { getAppEnv } from "./get-env";

const DEFAULT_GIT_USER_NAME = "osmosnote bot";
const DEFAULT_GIT_USER_EMAIL = "osmosnote-bot@osmoscraft.org";

export async function ensureRepoConfig() {
  // Todo stop if there is no git
  await printDiagnosticsToConsole();

  // load environment variables
  const debugEnvPath = path.join(process.cwd(), ".env");
  if (debugEnvPath && fs.existsSync(debugEnvPath)) {
    console.log(`[config] Using dotenv: ${debugEnvPath}`);
    const configResult = dotenv.config({ path: debugEnvPath });
    if (configResult.error) {
      console.error(`[config] .env contains error`, configResult.error);
      process.exit(1);
    }
  }
  const env = getAppEnv();
  Object.entries(env).forEach((entry) => console.log(`[config] env ${entry[0]}: ${entry[1]}`));

  // ensure repo dir
  const repoDir = env.OSMOSNOTE_REPO_DIR;
  if (!fs.existsSync(repoDir)) {
    console.log(`[config] Creating dir: ${repoDir}`);
    try {
      fs.ensureDirSync(repoDir);
    } catch (error) {
      console.error(`[config] Error creating repo directory: ${repoDir}`, error);
      process.exit(1);
    }
  }

  // ensure repo dir is managed by git
  const dotGit = path.join(env.OSMOSNOTE_REPO_DIR!, ".git");
  if (!fs.existsSync(dotGit)) {
    console.log(`[config] Initializing git: ${dotGit}`);
    try {
      const initResult = await execAsync("git init -q", { cwd: repoDir });
      if (initResult.stderr) {
        console.log(initResult.stderr);
      }
    } catch (error) {
      console.error(`[config] Error initialize git: ${repoDir}`, error);
      process.exit(1);
    }
  }

  // ensure user.name
  try {
    const { stdout } = await execAsync(`git config --get user.name`, { cwd: repoDir });
    console.log(`[config] Git username: ${stdout.trim()}`);
  } catch (error) {
    console.log(`[config] Initializing git username: ${DEFAULT_GIT_USER_NAME}`);
    await execAsync(`git config user.name "${DEFAULT_GIT_USER_NAME}"`, { cwd: repoDir });
  }

  // ensure user.email
  try {
    const { stdout } = await execAsync(`git config --get user.email`, { cwd: repoDir });
    console.log(`[config] Git email: ${stdout.trim()}`);
  } catch (error) {
    console.log(`[config] Initializing git user email: ${DEFAULT_GIT_USER_EMAIL}`);
    await execAsync(`git config user.email "${DEFAULT_GIT_USER_EMAIL}"`, { cwd: repoDir });
  }

  console.log(`[config] System ready ${repoDir}`);
}
