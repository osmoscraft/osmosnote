import type { CommandHandler } from ".";

export const handleVersionsSync: CommandHandler = async ({ context }) => {
  const result = await context.sourceControlService.sync();

  context.componentRefs.statusBar.showText(result.message);

  return {};
};
