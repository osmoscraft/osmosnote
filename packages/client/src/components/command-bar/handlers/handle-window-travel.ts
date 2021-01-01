import type { CommandHandler } from ".";

export const handleGoToEditor: CommandHandler = ({ context }) => ({
  onExecute: () => context.componentRefs.textEditor.focusTextArea(),
});

export const handleGoToReferences: CommandHandler = ({ context }) => ({
  onExecute: () => context.componentRefs.referencePanel.focusOnActiveLink(),
});

export const handleGoToHeader: CommandHandler = ({ context }) => ({
  onExecute: () => context.componentRefs.documentHeader.focusHeadingInput(),
});
