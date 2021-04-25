import { getRepoMetadata } from "../lib/repo-metadata";
import { createHandler } from "../lib/create-handler";
import { gitDiffStaged, gitDiffUnstaged, gitFetch, gitStatus } from "../lib/git";

export interface GetVersionStatusInput {}

export interface GetVersionStatusOutput {
  message: string;
  isUpToDate: boolean | null;
}

export const handleGetVersionStatus = createHandler<GetVersionStatusOutput, GetVersionStatusInput>(async (input) => {
  const config = await getRepoMetadata();
  const notesDir = config.repoDir;

  let { error: fetchError } = await gitFetch(notesDir);
  if (fetchError !== null) {
    return {
      message: fetchError,
      isUpToDate: null,
    };
  }

  let { message: diffMessage, error: diffError, isDifferent } = await gitDiffUnstaged(notesDir);
  if (diffError !== null) {
    return {
      message: diffError,
      isUpToDate: null,
    };
  }

  if (isDifferent) {
    return {
      message: diffMessage ?? "Unknown git unstaged diff result",
      isUpToDate: false,
    };
  }

  ({ message: diffMessage, error: diffError, isDifferent } = await gitDiffStaged(notesDir));
  if (diffError !== null) {
    return {
      message: diffError,
      isUpToDate: null,
    };
  }

  if (isDifferent) {
    return {
      message: diffMessage ?? "Unknown git staged diff result",
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
