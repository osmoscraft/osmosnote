import { createHandler } from "../lib/create-handler";
import { gitFetchV2, gitForcePush, gitRemoteDefaultBranch } from "../lib/git";
import { getRepoMetadata } from "../lib/repo-metadata";

export interface ForcePushInput {}

export interface ForcePushOutput {
  success: boolean;
  message?: string;
}

export const handleForcePush = createHandler<ForcePushOutput, ForcePushInput>(async (input) => {
  const config = await getRepoMetadata();

  const forcePushResult = await gitForcePush(config.repoDir);
  if (!forcePushResult.success) {
    return {
      success: false,
      message: forcePushResult.message,
    };
  }

  return {
    success: true,
  };
});
