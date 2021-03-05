import type { CommandHandler, CommandHandlerContext } from "../command-bar.component.js";

export const handleVersionsSync: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => versionSyncRunOnMatch(context),
});

export const versionSyncRunOnMatch = async (context: CommandHandlerContext) => {
  context.componentRefs.statusBar.setMessage("Sync…");

  try {
    const result = await context.apiService.syncVersions();
    context.componentRefs.statusBar.setMessage(result.message);
  } catch (error) {
    context.componentRefs.statusBar.setMessage("Error syncing versions", "error");
  }
};
