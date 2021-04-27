import { createHandler } from "../lib/create-handler";
import { gitSetRemoteUrl } from "../lib/git";
import { getRepoMetadata } from "../lib/repo-metadata";

export interface SetGitRemoteInput {
  url: string;
}

export interface SetGitRemoteOutput {
  success: boolean;
  message?: string;
}

export const handleSetGitRemote = createHandler<SetGitRemoteOutput, SetGitRemoteInput>(async (input) => {
  // Assumption:
  // Local is already a git repo
  // Local might already have a remote url

  // clean up existing remote
  const config = await getRepoMetadata();
  const result = await gitSetRemoteUrl(config.repoDir, input.url);

  return {
    success: result.success,
    message: result.message,
  };
});
