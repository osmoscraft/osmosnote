import type { CommandHandler } from ".";

export const handleGoToEditor: CommandHandler = ({ context }) => {
  return {
    onExecute: () => context.componentRefs.textEditor.focusTextArea(),
  };
};

export const handleGoToReferences: CommandHandler = ({ context }) => {
  return {
    onExecute: () => context.componentRefs.referencePanel.focusOnActiveLink(),
  };
};

export const handleGoToHeader: CommandHandler = ({ context }) => {
  return {
    onExecute: () => context.componentRefs.documentHeader.focusHeadingInput(),
  };
};
