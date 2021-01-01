import type { CommandHandler } from ".";

export const handleVersionsSync: CommandHandler = async ({ context }) => ({
  onExecute: async () => {
    context.componentRefs.statusBar.setMessage("Syncing…");

    try {
      const result = await context.sourceControlService.sync();
      context.componentRefs.statusBar.setMessage(result.message);
    } catch (error) {
      context.componentRefs.statusBar.setMessage("Error syncing", "error");
    }
  },
});
