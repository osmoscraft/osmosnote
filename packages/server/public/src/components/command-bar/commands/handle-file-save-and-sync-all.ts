import type { CommandHandler } from "../command-bar.component.js";

export const handleFileSaveAndSyncAll: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    if (context.trackChangeService.isDirty() || context.trackChangeService.isNew()) {
      await context.syncService.saveFile();
    }
    await context.syncService.syncAllFileVersions();
    await context.syncService.checkAllFileVersions();
  },
});
