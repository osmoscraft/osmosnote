import type { CommandHandler } from "../command-bar.component.js";

export const handleShutdown: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    if (await context.trackChangeService.isDirty()) {
      if (!confirm("You have unsaved changes, do you want to shutdown?")) {
        return;
      }
    }

    try {
      await context.apiService.shutdown();
      window.close();
    } catch (e) {
      console.error("[shudown] something went wrong during shutdown. Please inspect server logs", e);
    }
  },
});
