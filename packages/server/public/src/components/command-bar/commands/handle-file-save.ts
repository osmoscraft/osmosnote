import type { CommandHandler, CommandHandlerContext } from "../command-bar.component.js";

export const handleFileSave: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    if (context.trackChangeService.isDirty() || context.trackChangeService.isNew()) {
      await context.syncService.saveFile();
    }
    await context.syncService.checkAllFileVersions();
  },
});
