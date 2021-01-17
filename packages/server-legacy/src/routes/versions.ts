import type { RouteHandlerMethod } from "fastify";
import { getConfig } from "../config";
import { runShell, RunShellResult } from "../lib/run-shell";

export interface HandleVersions {
  Body: VersionsBody;
  Reply: VersionsReply;
}

export interface VersionsBody {
  action: "sync" | "check";
}

export interface VersionsReply {
  message: string;
}

export const handleVersions: RouteHandlerMethod<any, any, any, HandleVersions> = async (request, reply) => {
  const config = await getConfig();
  const notesDir = config.notesDir;

  if (request.body.action === "check") {
    const stageResult = await runShell("git add -A", { cwd: notesDir });
    let exit = handleError(stageResult, "Stage error");
    if (exit) return exit;

    const fetchResult = await runShell("git fetch", { cwd: notesDir });
    exit = handleError(fetchResult, "Fetch error");
    if (exit) return exit;

    const diffResult = await runShell("git diff --cached --stat", { cwd: notesDir });
    exit = handleError(diffResult, "Diff error");
    if (exit) return exit;

    if (!diffResult.stdout) {
      return {
        message: "Already up to date.",
      };
    }

    return {
      message: diffResult.stdout.trim().split("\n").pop()!,
    };
  }

  if (request.body.action === "sync") {
    const pullResult = await runShell("git pull", { cwd: notesDir });
    let exit = handleError(pullResult, "Fetch error");
    if (exit) return exit;

    const stageResult = await runShell("git add -A", { cwd: notesDir });
    exit = handleError(stageResult, "Stage error");
    if (exit) return exit;

    const diffResult = await runShell("git diff --cached --stat", { cwd: notesDir });
    exit = handleError(diffResult, "Diff error");
    if (exit) return exit;

    if (!diffResult.stdout) {
      return {
        message: "Already up to date.",
      };
    }

    const commitResult = await runShell(`git commit -m "auto-generated commit" -q`, { cwd: notesDir });
    exit = handleError(commitResult, "Commit error");
    if (exit) return exit;

    const pushResult = await runShell(`git push`, { cwd: notesDir });
    exit = handleError(pushResult, "Push error");
    if (exit) return exit;

    // git push message is in stderr by default
    const pushMessage = pushResult.stderr.trim().split("\n").pop()!;

    return {
      message: pushMessage,
    };
  }

  return {
    message: "Unknown action",
  };
};

function handleError(result: RunShellResult, message: string) {
  if (result.error) {
    console.error(message);
    result.error?.name.length && console.log("error name", result.error.name);
    result.error?.code && console.log("error code", result.error.code);
    result.error?.message.length && console.log("error message", result.error.message);
    result.stderr?.length && console.log("stderr", result.stderr);

    return {
      message,
    };
  }
}
