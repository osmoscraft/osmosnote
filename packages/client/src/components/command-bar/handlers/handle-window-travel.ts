import type { CommandHandler } from ".";

export const handleGoToEditor: CommandHandler = ({ context }) => {
  return {
    runAfterClose: () => context.componentRefs.textEditor.focusTextArea(),
  };
};

export const handleGoToReferences: CommandHandler = ({ context }) => {
  return {
    runAfterClose: () => context.componentRefs.referencePanel.focusOnActiveLink(),
  };
};

export const handleGoToHeader: CommandHandler = ({ context }) => {
  return {
    runAfterClose: () => context.componentRefs.documentHeader.focusHeadingInput(),
  };
};
