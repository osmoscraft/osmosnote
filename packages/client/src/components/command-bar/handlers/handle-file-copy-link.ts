import type { CommandHandler } from ".";
import { sendToClipboard } from "../../../lib/clipboard";
import { filenameToId } from "../../../lib/id";
import { getNoteConfigFromUrl } from "../../../lib/url";

export const handleFileCopyLink: CommandHandler = ({ context }) => {
  const { filename } = getNoteConfigFromUrl();
  const title = context.componentRefs.documentHeader.getTitle();

  if (filename) {
    const link = `[${title}](${filenameToId(filename)})`;

    sendToClipboard(link);
    context.componentRefs.statusBar.showText(`Copied to clipboard: ${link}`);
  } else {
    context.componentRefs.statusBar.showText(`Error: current page is not a note`);
  }

  return {};
};
