import type { CommandHandler } from "../command-bar.component.js";

export const handleVersionSyncAll: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    await context.syncService.syncAllFileVersions();
    await context.syncService.checkAllFileVersions();
  },
});
