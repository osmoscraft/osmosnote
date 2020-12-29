import type { CommandHandler } from ".";

export const handleFileFormat: CommandHandler = ({ context }) => {
  context.componentRefs.textEditor.handleDraftChange({ fixFormat: true });
  context.componentRefs.statusBar.showText(`File format success`);

  return {};
};
