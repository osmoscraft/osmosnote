import type { CommandHandler, CommandHandlerContext } from "../command-bar.component.js";
import { versionCheckRunOnMatch } from "./handle-version-check.js";

export const handleVersionsSyncAndCheck: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    await versionSyncRunOnMatch(context);
    await versionCheckRunOnMatch(context);
  },
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
