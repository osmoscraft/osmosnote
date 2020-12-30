import type { CommandHandler } from ".";

export const handleVersionsSync: CommandHandler = async ({ context }) => {
  // don't await. exit immediately
  context.componentRefs.statusBar.showText("Syncing…");
  context.sourceControlService.sync().then((result) => {
    context.componentRefs.statusBar.showText(result.message);
  });

  return {};
};
