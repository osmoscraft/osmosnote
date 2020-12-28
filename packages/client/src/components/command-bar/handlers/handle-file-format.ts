import type { CommandHandler } from ".";

export const handleFileFormat: CommandHandler = ({ context }) => {
  context.componentRefs.textEditor.format();
  context.componentRefs.statusBar.showText(`File format success`);

  return {};
};
