import { createHandler } from "../lib/create-handler";
import { gitFetch, gitFetchV2, gitRemoteDefaultBranch, gitReset, gitSetRemoteUrl, gitTrackBranch } from "../lib/git";
import { getRepoMetadata } from "../lib/repo-metadata";

export interface ResetLocalVersionInput {}

export interface ResetLocalVersionOutput {
  success: boolean;
  message?: string;
}

export const handleResetLocalVersion = createHandler<ResetLocalVersionOutput, ResetLocalVersionInput>(async (input) => {
  const config = await getRepoMetadata();

  const remoteBranchResult = await gitRemoteDefaultBranch(config.repoDir);
  if (!remoteBranchResult.success) {
    return {
      success: false,
      message: remoteBranchResult.message,
    };
  }

  const fetchResult = await gitFetchV2(config.repoDir, remoteBranchResult.branch!);
  if (!fetchResult.success) {
    return {
      success: false,
      message: fetchResult.message,
    };
  }

  const resetResult = await gitReset(config.repoDir, remoteBranchResult.branch!);
  if (!resetResult.success) {
    return {
      success: false,
      message: resetResult.message,
    };
  }

  const trackBranchResult = await gitTrackBranch(config.repoDir, remoteBranchResult.branch!);
  if (!trackBranchResult.success) {
    return {
      success: false,
      message: trackBranchResult.message,
    };
  }

  return {
    success: true,
  };
});
