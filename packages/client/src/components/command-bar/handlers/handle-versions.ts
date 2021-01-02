import type { CommandHandler } from ".";

export const handleVersionsSync: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    context.componentRefs.statusBar.setMessage("Syncing…");

    try {
      const result = await context.sourceControlService.sync();
      context.componentRefs.statusBar.setMessage(result.message);
    } catch (error) {
      context.componentRefs.statusBar.setMessage("Error syncing", "error");
    }
  },
});

export const handleVersionsCheck: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    context.componentRefs.statusBar.setMessage("Checking…");

    try {
      const result = await context.sourceControlService.check();
      context.componentRefs.statusBar.setMessage(result.message);
    } catch (error) {
      context.componentRefs.statusBar.setMessage("Error checking version", "error");
    }
  },
});
