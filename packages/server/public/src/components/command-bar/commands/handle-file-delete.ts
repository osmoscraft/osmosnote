import type { CommandHandler, CommandHandlerContext } from "../command-bar.component.js";

export const handleFileDelete: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    const { id } = context.routeService.getNoteConfigFromUrl();
    if (id) {
      try {
        const data = await context.apiService.getIncomingLinks(id);
        if (data.incomingLinks.length) {
          const isConfirmed = context.windowRef.window.confirm(
            `This note is referenced by other notes. Are you sure you want to delete it?\n\nNotes that are referencing this note:\n` +
              data.incomingLinks.map((item) => item.title).join("\n")
          );

          if (!isConfirmed) {
            context.notificationService.displayMessage("Delete canceled", "info");
            return;
          }
        }

        await context.apiService.deleteNote(id);
        await context.syncService.syncAllFileVersions();
        context.notificationService.displayMessage("Note deleted", "warning");
      } catch (error) {
        console.error(error);
        context.notificationService.displayMessage("Delete note failed.", "error");
      }
    }
  },
});
