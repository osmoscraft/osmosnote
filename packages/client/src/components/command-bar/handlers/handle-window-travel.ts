import type { CommandHandler } from ".";

export const handleWindowTravel: CommandHandler = ({ input, context }) => {
  const windowChar = input.command.split("")[1];

  switch (windowChar) {
    case "e":
      context.componentRefs.contentHost.focus();
      context.componentRefs.statusBar.showText(`[window] travelled to Editor`);
      break;
    case "r":
      context.componentRefs.referencePanel.focus();
      context.componentRefs.statusBar.showText(`[window] travelled to References`);
      break;
    case "h":
      context.componentRefs.documentHeader.focus();
      context.componentRefs.statusBar.showText(`[window] travelled to Header`);
      break;
  }

  return {
    skipCursorRestore: true,
  };
};
