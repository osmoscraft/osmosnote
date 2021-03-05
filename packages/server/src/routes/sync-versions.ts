import { getConfig } from "../config";
import { createHandler } from "../lib/create-handler";
import { gitAdd, gitCommit, gitDiff, gitPull, gitPush } from "../lib/git";

export interface SyncVersionsInput {}

export interface SyncVersionsOutput {
  message: string;
}

export const handleSyncVersions = createHandler<SyncVersionsOutput, SyncVersionsInput>(async (input) => {
  const config = await getConfig();
  const notesDir = config.notesDir;
  let error: string | null;
  let message: string | null;
  let isDifferent: boolean | null;

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

  ({ message, error, isDifferent } = await gitDiff(notesDir));
  if (error !== null) {
    return {
      message: error,
    };
  }
  if (isDifferent !== true) {
    return {
      message: message ?? "Already up to date.",
    };
  }

  ({ error } = await gitCommit(notesDir));
  if (error !== null) {
    return {
      message: error,
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
