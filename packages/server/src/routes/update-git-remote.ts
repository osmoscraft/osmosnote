import { createHandler } from "../lib/create-handler";

export interface UpdateGitRemoteInput {
  originUrl: string;
}

export interface UpdateGitRemoteOutput {}

export const handleUpdateGitRemote = createHandler<UpdateGitRemoteOutput, UpdateGitRemoteInput>(async (input) => {
  // TODO it's possible the remote has no branch set up
  // When doing first git pull, need to handle error gracefully
  // When doing first git push, need to set upstream to the same branch name as the local default (either main or master)

  return {};
});
