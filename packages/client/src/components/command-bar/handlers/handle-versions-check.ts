import type { CommandHandler } from ".";

export const handleVersionsCheck: CommandHandler = async ({ context }) => ({
  onExecute: async () => {
    context.componentRefs.statusBar.setMessage("Checking…");
    try {
      const result = await context.sourceControlService.check();
      context.componentRefs.statusBar.setMessage(result.message);
    } catch (error) {
      context.componentRefs.statusBar.setMessage("Error checking version", "error");
    }
  },
});
