import { getAppConfig } from "../lib/app-config";
import { createHandler } from "../lib/create-handler";
import { gitAdd, gitCommit, gitDiffStaged, gitDiffUnstaged, gitPull, gitPush, gitStatus } from "../lib/git";

export interface SyncVersionsInput {}

export interface SyncVersionsOutput {
  message: string;
}

export const handleSyncVersions = createHandler<SyncVersionsOutput, SyncVersionsInput>(async (input) => {
  const config = await getAppConfig();
  const notesDir = config.repoDir;
  let error: string | null;
  let message: string | null;
  let isDifferent: boolean | null;
  let isUpToDate: boolean | null;

  ({ error } = await gitPull(notesDir));
  if (error !== null) {
    return {
      message: error,
    };
  }

  ({ error } = await gitAdd(notesDir));
  if (error !== null) {
    return {
      message: error,
    };
  }

  // Commit if there are any new staged changes
  ({ message, error, isDifferent } = await gitDiffStaged(notesDir));
  if (error !== null) {
    return {
      message: error,
    };
  }
  if (isDifferent) {
    // commit only if there is something to commit
    ({ error } = await gitCommit(notesDir));
    if (error !== null) {
      return {
        message: error,
      };
    }
  }

  ({ message, error, isUpToDate } = await gitStatus(notesDir));
  if (error !== null) {
    return {
      message: error,
      isUpToDate: null,
    };
  }

  if (isUpToDate) {
    return {
      message: message ?? "Already up to date.",
    };
  }

  ({ message, error } = await gitPush(notesDir));
  if (error !== null) {
    return {
      message: error,
    };
  }

  return {
    message: message ?? "Unknown git push result",
  };
});
