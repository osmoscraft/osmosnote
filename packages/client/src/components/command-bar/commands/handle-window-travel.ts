import type { CommandHandler } from ".";

export const handleGoToEditor: CommandHandler = ({ context }) => ({
  runOnMatch: () => context.componentRefs.textEditor.focusTextArea(),
});

export const handleGoToReferences: CommandHandler = ({ context }) => ({
  runOnMatch: () => context.componentRefs.referencePanel.focusOnActiveLink(),
});

export const handleGoToHeader: CommandHandler = ({ context }) => ({
  runOnMatch: () => context.componentRefs.documentHeader.focusHeadingInput(),
});
