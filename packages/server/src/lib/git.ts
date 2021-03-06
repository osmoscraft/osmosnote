import { getRunShellError, runShell } from "./run-shell";

export interface GitCommandOutput {
  message: string | null;
  error: string | null;
}

export async function gitAdd(repoRoot: string): Promise<GitCommandOutput> {
  const stageResult = await runShell("git add -A", { cwd: repoRoot });
  const error = getRunShellError(stageResult, "Stage error");

  return {
    message: null,
    error: error?.message ?? null,
  };
}

export async function gitFetch(repoRoot: string): Promise<GitCommandOutput> {
  const fetchResult = await runShell("git fetch", { cwd: repoRoot });
  const error = getRunShellError(fetchResult, "Fetch error");

  return {
    message: null,
    error: error?.message ?? null,
  };
}

export async function gitPull(repoRoot: string): Promise<GitCommandOutput> {
  const pullResult = await runShell("git pull", { cwd: repoRoot });
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

export async function gitPush(repoRoot: string): Promise<GitCommandOutput> {
  const pushResult = await runShell(`git push`, { cwd: repoRoot });
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

export async function gitDiff(repoRoot: string): Promise<GitDiffOutput> {
  const diffResult = await runShell("git diff --cached --stat", { cwd: repoRoot });
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
  const statusResult = await runShell("git status", { cwd: repoRoot });
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
