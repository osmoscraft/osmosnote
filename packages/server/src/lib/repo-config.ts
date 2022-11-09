import dotenv from "dotenv";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { printDiagnosticsToConsole } from "./diagnostics";
import { execAsync } from "./exec-async";
import { getAppEnv } from "./get-env";

const DEFAULT_GIT_USER_NAME = "osmosnote bot";
const DEFAULT_GIT_USER_EMAIL = "osmosnote-bot@osmoscraft.org";

export async function ensureRepoConfig() {
  // Todo stop if there is no git
  await printDiagnosticsToConsole();

  // Show user's name
  const whoAmIResult = await execAsync(`whoami`);
  console.log(`[config] Username: ${whoAmIResult.stdout.trim()}`);

  // load environment variables
  const debugEnvPath = path.join(process.cwd(), ".env");
  if (debugEnvPath && existsSync(debugEnvPath)) {
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
  if (!existsSync(repoDir)) {
    console.log(`[config] Creating dir: ${repoDir}`);
    try {
      await fs.mkdir(repoDir, { recursive: true });
    } catch (error) {
      console.error(`[config] Error creating repo directory: ${repoDir}`, error);
      process.exit(1);
    }
  }

  // ensure repo dir is managed by git
  const dotGit = path.join(env.OSMOSNOTE_REPO_DIR!, ".git");
  if (!existsSync(dotGit)) {
    console.log(`[config] Initializing git: ${dotGit}`);
    let mainBranchCreated = false;
    try {
      const initResult = await execAsync("git init --q --initial-branch=main", { cwd: repoDir });
      mainBranchCreated = true;
    } catch (error) {
      console.error(`[config] Error creating main branch. Fallback to master`);
    }

    if (!mainBranchCreated) {
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
