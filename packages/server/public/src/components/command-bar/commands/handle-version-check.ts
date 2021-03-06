import type { CommandHandler, CommandHandlerContext } from "../command-bar.component.js";

export const handleVersionsCheck: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => versionCheckRunOnMatch(context),
});

export const versionCheckRunOnMatch = async (context: CommandHandlerContext) => {
  context.notificationService.displayMessage("Checking…");

  try {
    const result = await context.apiService.getVersionStatus();
    if (result.isUpToDate) {
      context.notificationService.displayMessage(result.message);
    } else {
      context.notificationService.displayMessage(result.message, "warning");
    }
  } catch (error) {
    context.componentRefs.statusBar.setMessage("Error checking version", "error");
  }
};
