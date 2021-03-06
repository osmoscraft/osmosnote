import { getConfig } from "../config";
import { createHandler } from "../lib/create-handler";
import { gitDiff, gitFetch, gitStatus } from "../lib/git";

export interface GetVersionStatusInput {}

export interface GetVersionStatusOutput {
  message: string;
  isUpToDate: boolean | null;
}

export const handleGetVersionStatus = createHandler<GetVersionStatusOutput, GetVersionStatusInput>(async (input) => {
  const config = await getConfig();
  const notesDir = config.notesDir;

  let { error: fetchError } = await gitFetch(notesDir);
  if (fetchError !== null) {
    return {
      message: fetchError,
      isUpToDate: null,
    };
  }

  let { message: diffMessage, error: diffError, isDifferent } = await gitDiff(notesDir);
  if (diffError !== null) {
    return {
      message: diffError,
      isUpToDate: null,
    };
  }

  if (isDifferent) {
    return {
      message: diffMessage ?? "Unknown git diff result",
      isUpToDate: false,
    };
  }

  let { message: statusMessage, error: statusError, isUpToDate } = await gitStatus(notesDir);
  if (statusError !== null) {
    return {
      message: statusError,
      isUpToDate: null,
    };
  }

  if (isUpToDate === null) {
    return {
      message: "Unknown git status",
      isUpToDate: null,
    };
  }

  return {
    message: statusMessage ?? "Unknown status message",
    isUpToDate: isUpToDate,
  };
});
