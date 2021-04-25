import { createHandler } from "../lib/create-handler";
import { testConnection } from "../lib/git";

export interface TestGitHostConnectionInput {
  remoteUrl: string;
}

export interface TestGitHostConnectionOutput {
  success: boolean;
  message?: string;
}

export const handleTestGitHostConnection = createHandler<TestGitHostConnectionOutput, TestGitHostConnectionInput>(
  async (input) => {
    return testConnection(input.remoteUrl);
  }
);
