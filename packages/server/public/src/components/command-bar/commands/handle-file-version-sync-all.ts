import type { CommandHandler } from "../command-bar.component.js";

export const handleVersionSyncAll: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    if (context.trackChangeService.isDirty()) {
      await context.syncService.saveFile();
    }
    await context.syncService.syncAllFileVersions();
    await context.syncService.checkAllFileVersions();
  },
});
