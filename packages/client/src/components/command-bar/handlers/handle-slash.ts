import type { CommandHandler } from ".";

export const handleSlash: CommandHandler = ({ context }) => {
  context.componentRefs.textEditor.insertAtCursor("/");

  return {};
};
