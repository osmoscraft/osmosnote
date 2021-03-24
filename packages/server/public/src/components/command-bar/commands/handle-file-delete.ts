import type { CommandHandler, CommandHandlerContext } from "../command-bar.component.js";

export const handleFileDelete: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    const { id } = context.routeService.getNoteConfigFromUrl();
    if (id) {
      try {
        await context.apiService.deleteNote(id);
        context.notificationService.displayMessage("Note deleted", "warning");
      } catch (error) {
        console.error(error);
        context.notificationService.displayMessage("Delete note failed.", "error");
      }
    }
  },
});
