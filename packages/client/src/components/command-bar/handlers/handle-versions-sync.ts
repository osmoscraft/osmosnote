import type { CommandHandler } from ".";

export const handleVersionsSync: CommandHandler = async ({ context }) => {
  // don't await. exit immediately
  context.componentRefs.statusBar.setMessage("Syncing…");
  context.sourceControlService.sync().then((result) => {
    context.componentRefs.statusBar.setMessage(result.message);
  });

  return {};
};
