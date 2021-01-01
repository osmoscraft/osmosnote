import type { CommandHandler } from ".";

export const handleFileFormat: CommandHandler = ({ context }) => {
  return {
    onExecute: () => {
      context.componentRefs.textEditor.handleDraftChange({ fixFormat: true });
      context.componentRefs.statusBar.setMessage(`Formatted`);
    },
  };
};
