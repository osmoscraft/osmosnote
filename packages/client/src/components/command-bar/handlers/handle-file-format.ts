import type { CommandHandler } from ".";

export const handleFileFormat: CommandHandler = ({ context }) => {
  context.componentRefs.textEditor.handleDraftChange({ fixFormat: true });
  context.componentRefs.statusBar.setMessage(`File format success`);

  return {};
};
