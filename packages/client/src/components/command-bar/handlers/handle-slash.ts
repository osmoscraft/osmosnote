import type { CommandHandler } from ".";
import { sendToClipboard } from "../../../lib/clipboard";

export const handleSlash: CommandHandler = ({ context }) => {
  sendToClipboard("/");

  context.statusBar.showText(`"/" copied to clipboard`);

  return {};
};
