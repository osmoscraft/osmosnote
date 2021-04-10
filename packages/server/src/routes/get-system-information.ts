import { createHandler } from "../lib/create-handler";
import { getSystemInformation, SystemInformation } from "../lib/diagnostics";

export interface GetSystemInformationInput {}

export interface GetSystemInformationOutput {
  systemInformation: SystemInformation;
}

export const handleGetSystemInformation = createHandler<GetSystemInformationOutput, GetSystemInformationInput>(
  async (input) => {
    const systemInformation = await getSystemInformation();

    return {
      systemInformation,
    };
  }
);
