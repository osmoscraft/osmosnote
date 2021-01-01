import type { CommandHandler } from ".";

export const handleVersionsCheck: CommandHandler = async ({ context }) => {
  // don't await. exit immediately
  context.componentRefs.statusBar.setMessage("Checking…");
  context.sourceControlService.check().then((result) => {
    context.componentRefs.statusBar.setMessage(result.message);
  });

  return {};
};
