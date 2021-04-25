import { createHandler } from "../lib/create-handler";
import { getRemoteUrl } from "../lib/git";

export interface GetSettingsInput {}

export interface GetSettingsOutput {
  remoteUrl: string | null;
}

export const handleGetSettings = createHandler<GetSettingsOutput, GetSettingsInput>(async (input) => {
  const remoteUrl = await getRemoteUrl();

  return {
    remoteUrl,
  };
});
