import type { CommandHandler } from "../command-bar.component.js";

export const handleFileSyncAll: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => context.syncService.syncAllFileVersions(),
});
