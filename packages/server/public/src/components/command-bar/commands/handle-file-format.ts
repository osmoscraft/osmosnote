import type { CommandHandler } from "../command-bar.component.js";

export const handleFileFormat: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    await context.formatService.compile(context.componentRefs.textEditor.host);
  },
});
