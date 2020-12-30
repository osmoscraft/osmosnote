import type { CommandHandler } from ".";

export const handleVersionsCheck: CommandHandler = async ({ context }) => {
  // don't await. exit immediately
  context.componentRefs.statusBar.showText("Checking…");
  context.sourceControlService.check().then((result) => {
    context.componentRefs.statusBar.showText(result.message);
  });

  return {};
};
