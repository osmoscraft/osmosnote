import type { CommandHandler } from ".";

export const handleSlash: CommandHandler = ({ context }) => ({
  runOnMatch: () => context.componentRefs.textEditor.insertAtCursor("/"),
});
