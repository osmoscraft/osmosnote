import type { CommandHandler } from ".";
import { sendToClipboard } from "../../../lib/clipboard";

export const handleSlash: CommandHandler = ({ context }) => {
  sendToClipboard("/");

  context.componentRefs.statusBar.showText(`"/" copied to clipboard`);

  return {};
};
