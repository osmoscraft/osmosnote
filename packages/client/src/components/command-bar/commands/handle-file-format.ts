import type { CommandHandler } from ".";

export const handleFileFormat: CommandHandler = ({ context }) => {
  return {
    runOnMatch: () => {
      context.componentRefs.textEditor.handleDraftChange({ fixFormat: true });
      context.componentRefs.statusBar.setMessage(`Formatted`);
    },
  };
};
