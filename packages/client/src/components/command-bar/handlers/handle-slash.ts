import type { CommandHandler } from ".";

export const handleSlash: CommandHandler = ({ context }) => ({
  onExecute: () => context.componentRefs.textEditor.insertAtCursor("/"),
});
