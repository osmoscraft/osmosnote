import { execAsync } from "./exec-async";
import { getRunShellError, runShell } from "./run-shell";

export interface GitCommandOutput {
  message: string | null;
  error: string | null;
}

export const DEFAULT_REMOTE = "origin";

export async function gitAdd(repoRoot: string): Promise<GitCommandOutput> {
  const stageResult = await runShell("git add -A", { cwd: repoRoot });
  const error = getRunShellError(stageResult, "Stage error");

  return {
    message: null,
    error: error?.message ?? null,
  };
}

export async function gitFetch(repoRoot: string): Promise<GitCommandOutput> {
  const fetchResult = await runShell(`git fetch`, { cwd: repoRoot });
  const error = getRunShellError(fetchResult, "Fetch error");

  return {
    message: null,
    error: error?.message ?? null,
  };
}

export async function gitPull(repoRoot: string): Promise<GitCommandOutput> {
  const branch = await gitCurrentBranch(repoRoot);

  const pullResult = await runShell(`git pull`, { cwd: repoRoot });
  const error = getRunShellError(pullResult, "Fetch error");

  return {
    message: null,
    error: error?.message ?? null,
  };
}

export async function gitCommit(repoRoot: string, message = "Auto-generated commit"): Promise<GitCommandOutput> {
  const commitResult = await runShell(`git commit -m "${message}" -q`, { cwd: repoRoot });
  const error = getRunShellError(commitResult, "Commit error");

  return {
    message: null,
    error: error?.message ?? null,
  };
}

export async function gitPush(repoRoot: string, remote = DEFAULT_REMOTE): Promise<GitCommandOutput> {
  const branch = await gitCurrentBranch(repoRoot);
  const pushResult = await runShell(`git push -u ${remote} ${branch}`, { cwd: repoRoot });
  const error = getRunShellError(pushResult, "Push error");
  if (error)
    return {
      message: null,
      error: error?.message ?? null,
    };

  // git push message is in stderr by default
  const pushMessage = pushResult.stderr.trim().split("\n").pop()?.trim();

  if (!pushMessage) {
    return {
      message: null,
      error: "Unknown git push result",
    };
  }

  return {
    message: pushMessage,
    error: null,
  };
}

export interface GitDiffOutput extends GitCommandOutput {
  isDifferent: boolean | null;
}

export async function gitDiffStaged(repoRoot: string): Promise<GitDiffOutput> {
  const diffResult = await runShell("git diff --stat --cached", { cwd: repoRoot });
  const error = getRunShellError(diffResult, "Diff error");
  if (error)
    return {
      message: null,
      isDifferent: null,
      error: error.message ? error.message : "Unknown git diff error",
    };

  if (!diffResult.stdout) {
    return {
      message: "Already up to date.",
      isDifferent: false,
      error: null,
    };
  }

  const gitStatus = diffResult.stdout.trim().split("\n").pop()?.trim();
  if (!gitStatus)
    return {
      message: null,
      isDifferent: null,
      error: "Unknown git status",
    };

  return {
    message: gitStatus,
    isDifferent: true,
    error: null,
  };
}

export async function gitDiffUnstaged(repoRoot: string): Promise<GitDiffOutput> {
  const diffResult = await runShell("git diff --stat", { cwd: repoRoot });
  const error = getRunShellError(diffResult, "Diff error");
  if (error)
    return {
      message: null,
      isDifferent: null,
      error: error.message ? error.message : "Unknown git diff error",
    };

  if (!diffResult.stdout) {
    return {
      message: "Already up to date.",
      isDifferent: false,
      error: null,
    };
  }

  const gitStatus = diffResult.stdout.trim().split("\n").pop()?.trim();
  if (!gitStatus)
    return {
      message: null,
      isDifferent: null,
      error: "Unknown git status",
    };

  return {
    message: gitStatus,
    isDifferent: true,
    error: null,
  };
}

export interface GitStatusOutput extends GitCommandOutput {
  isUpToDate: boolean | null;
}

export async function gitStatus(repoRoot: string): Promise<GitStatusOutput> {
  const statusResult = await runShell("git status -u", { cwd: repoRoot });
  const error = getRunShellError(statusResult, "Status error");
  if (error)
    return {
      message: null,
      isUpToDate: null,
      error: error.message ? error.message : "Unknown git status error",
    };

  if (!statusResult.stdout) {
    return {
      message: null,
      isUpToDate: null,
      error: "Git status had no output",
    };
  }

  const hasUntracked = statusResult.stdout
    .trim()
    .split("\n")
    .find((l) => l.includes("Untracked files"));

  if (hasUntracked) {
    return {
      message: "New files exist. Please sync",
      isUpToDate: false,
      error: null,
    };
  }

  const gitStatus = statusResult.stdout
    .trim()
    .split("\n")
    .find((line) => line.includes("Your branch"))
    ?.trim();

  if (!gitStatus?.includes("up to date")) {
    return {
      message: gitStatus ?? "Unknown status",
      isUpToDate: false,
      error: null,
    };
  }

  return {
    message: gitStatus,
    isUpToDate: true,
    error: null,
  };
}

export async function gitCurrentBranch(repoRoot: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`git branch --show-current`, { cwd: repoRoot });
    return stdout.trim();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function gitGetRemoteUrl(repoRoot: string, name = "origin"): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`git remote get-url ${name}`, { cwd: repoRoot });
    return stdout.trim();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export interface GitOperationResult {
  success: boolean;
  message?: string;
}

export async function gitSetRemoteUrl(repoRoot: string, url: string): Promise<GitOperationResult> {
  const remoteUrl = await gitGetRemoteUrl(repoRoot, DEFAULT_REMOTE);
  if (remoteUrl !== null) {
    try {
      await execAsync(`git remote remove ${DEFAULT_REMOTE}`, { cwd: repoRoot });
      console.log(`[update-git-remote] Removed existing remote ${DEFAULT_REMOTE} ${remoteUrl}`);
    } catch (error: any) {
      console.log(`[update-git-remote] Error removing existing remote ${DEFAULT_REMOTE} ${remoteUrl}`);
      return {
        success: false,
        message: error?.message ?? `Error removing existing remote ${DEFAULT_REMOTE} ${remoteUrl}`,
      };
    }
  }

  try {
    await execAsync(`git remote add ${DEFAULT_REMOTE} ${url}`, { cwd: repoRoot });
    console.log(`[update-git-remote] Added remote ${DEFAULT_REMOTE} ${url}`);
  } catch (error: any) {
    console.log(`[update-git-remote] Error adding remote ${DEFAULT_REMOTE} ${url}`);
    return {
      success: false,
      message: error?.message ?? `Error adding remote ${DEFAULT_REMOTE} ${url}`,
    };
  }

  return {
    success: true,
  };
}

export async function gitLsRemoteUrl(repoRoot: string, remoteUrl: string): Promise<GitOperationResult> {
  try {
    const { stdout, stderr } = await execAsync(`git ls-remote ${remoteUrl}`, { cwd: repoRoot });
    if (stderr) {
      return {
        success: false,
        message: stderr.trim(),
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? "git ls-remote error",
    };
  }
}

export async function gitLsRemoteExists(repoRoot: string): Promise<boolean> {
  try {
    await execAsync(`git ls-remote --exit-code -q`, { cwd: repoRoot });
    return true;
  } catch (error: any) {
    if (error.code === 2) return false;

    console.error(`[git] error ls-remote`, error);
    throw error;
  }
}

export interface GitDefaultRemoteBranchResult extends GitOperationResult {
  branch?: string;
}

export async function gitRemoteDefaultBranch(repoRoot: string): Promise<GitDefaultRemoteBranchResult> {
  try {
    const PATTERN = "HEAD branch:";
    const { stdout } = await execAsync(`git remote show ${DEFAULT_REMOTE}`, { cwd: repoRoot });
    const lines = stdout.split("\n");
    const branch =
      lines
        .find((line) => line.includes(PATTERN))
        ?.trim()
        ?.slice(PATTERN.length)
        .trim() ?? "";
    if (!branch || branch.toLocaleLowerCase() === "(unknown)") {
      return {
        success: false,
        message: `No HEAD branch found.\n${stdout}`,
      };
    }

    return {
      success: true,
      branch,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? `git remote show ${DEFAULT_REMOTE}`,
    };
  }
}

export async function gitFetchV2(repoRoot: string, remoteBranch?: string): Promise<GitOperationResult> {
  const branch = remoteBranch ?? (await gitCurrentBranch(repoRoot));

  try {
    await execAsync(`git fetch ${DEFAULT_REMOTE} ${branch}`, { cwd: repoRoot });
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? `Error git fetch ${DEFAULT_REMOTE}/${branch}`,
    };
  }
}

export async function gitReset(repoRoot: string, remoteBranch?: string): Promise<GitOperationResult> {
  const branch = remoteBranch ?? (await gitCurrentBranch(repoRoot));

  try {
    await execAsync(`git reset --hard ${DEFAULT_REMOTE}/${branch}`, { cwd: repoRoot });
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? `Error reset --hard ${DEFAULT_REMOTE}/${branch}`,
    };
  }
}

export async function gitTrackBranch(repoRoot: string, remoteBranch: string): Promise<GitOperationResult> {
  try {
    await execAsync(`git branch -u ${DEFAULT_REMOTE}/${remoteBranch}`, { cwd: repoRoot });
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? `Error git branch -u ${DEFAULT_REMOTE}/${remoteBranch}`,
    };
  }
}

export async function gitForcePush(repoRoot: string): Promise<GitOperationResult> {
  const branch = await gitCurrentBranch(repoRoot);

  try {
    await execAsync(`git push --force -u ${DEFAULT_REMOTE} ${branch}`, { cwd: repoRoot });
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? `Error push --force -u ${DEFAULT_REMOTE} ${branch}`,
    };
  }
}
