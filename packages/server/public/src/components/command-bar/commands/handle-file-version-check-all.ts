import type { CommandHandler } from "../command-bar.component.js";

export const handleFileVersionCheckAll: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => context.syncService.checkAllFileVersions(),
});
