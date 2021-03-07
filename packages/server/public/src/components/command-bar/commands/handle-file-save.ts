import type { CommandHandler, CommandHandlerContext } from "../command-bar.component.js";

export const handleFileSave: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    await context.syncService.saveFile();
    await context.syncService.checkAllFileVersions();
  },
});
