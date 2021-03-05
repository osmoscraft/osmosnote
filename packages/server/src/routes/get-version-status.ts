import { getConfig } from "../config";
import { createHandler } from "../lib/create-handler";
import { gitDiff, gitFetch } from "../lib/git";

export interface GetVersionStatusInput {}

export interface GetVersionStatusOutput {
  message: string;
}

export const handleGetVersionStatus = createHandler<GetVersionStatusOutput, GetVersionStatusInput>(async (input) => {
  const config = await getConfig();
  const notesDir = config.notesDir;

  let { error: fetchError } = await gitFetch(notesDir);
  if (fetchError !== null) {
    return {
      message: fetchError,
    };
  }

  let { message, error: diffError } = await gitDiff(notesDir);
  if (diffError !== null) {
    return {
      message: diffError,
    };
  }

  return {
    message: message ?? "Unknown git diff result",
  };
});
