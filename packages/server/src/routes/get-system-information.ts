import { createHandler } from "../lib/create-handler";

export interface GetSystemInformationInput {}

export interface GetSystemInformationOutput {
  version: string;
}

const packageJson = require("../../../../package.json");

export const handleGetSystemInformation = createHandler<GetSystemInformationOutput, GetSystemInformationInput>(
  async (input) => {
    return {
      version: packageJson.version,
    };
  }
);
