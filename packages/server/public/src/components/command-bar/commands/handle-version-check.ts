import type { CommandHandler, CommandHandlerContext } from "../command-bar.component.js";

export const handleVersionsCheck: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => versionCheckRunOnMatch(context),
});

export const versionCheckRunOnMatch = async (context: CommandHandlerContext) => {
  context.componentRefs.statusBar.setMessage("Checking…");

  try {
    const result = await context.apiService.getVersionStatus();
    context.componentRefs.statusBar.setMessage(result.message);
  } catch (error) {
    context.componentRefs.statusBar.setMessage("Error checking version", "error");
  }
};
