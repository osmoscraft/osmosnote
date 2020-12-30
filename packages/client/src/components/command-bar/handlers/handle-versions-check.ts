import type { CommandHandler } from ".";

export const handleVersionsCheck: CommandHandler = async ({ context }) => {
  const result = await context.sourceControlService.check();

  context.componentRefs.statusBar.showText(result.message);

  return {};
};
