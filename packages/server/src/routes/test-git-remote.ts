import { createHandler } from "../lib/create-handler";
import { gitLsRemoteUrl } from "../lib/git";
import { getRepoMetadata } from "../lib/repo-metadata";

export interface TestGitRemoteInput {
  remoteUrl: string;
}

export interface TestGitRemoteOutput {
  success: boolean;
  message?: string;
}

export const handleTestGitRemote = createHandler<TestGitRemoteOutput, TestGitRemoteInput>(async (input) => {
  const config = await getRepoMetadata();
  return gitLsRemoteUrl(config.repoDir, input.remoteUrl);
});
