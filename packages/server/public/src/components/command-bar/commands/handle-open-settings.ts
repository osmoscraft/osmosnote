import type { CommandHandler, CommandHandlerContext } from "../command-bar.component.js";

export const handleOpenSettings: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    window.open("/settings", "_self");
  },
});
