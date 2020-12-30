import type { CommandHandler } from ".";

export const handleGoToEditor: CommandHandler = ({ context }) => {
  context.componentRefs.textEditor.focusTextArea();

  return {
    skipCursorRestore: true,
  };
};

export const handleGoToReferences: CommandHandler = ({ context }) => {
  context.componentRefs.referencePanel.focus();

  return {
    skipCursorRestore: true,
  };
};

export const handleGoToHeader: CommandHandler = ({ input, context }) => {
  context.componentRefs.documentHeader.focus();

  return {
    skipCursorRestore: true,
  };
};
