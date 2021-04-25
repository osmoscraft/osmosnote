import { createHandler } from "../lib/create-handler";
import { testConnection } from "../lib/git";

export interface TestGitRemoteInput {
  remoteUrl: string;
}

export interface TestGitRemoteOutput {
  success: boolean;
  message?: string;
}

export const handleTestGitRemote = createHandler<TestGitRemoteOutput, TestGitRemoteInput>(async (input) => {
  return testConnection(input.remoteUrl);
});
