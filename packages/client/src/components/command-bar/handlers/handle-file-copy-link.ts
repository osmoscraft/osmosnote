import type { CommandHandler } from ".";
import { sendToClipboard } from "../../../utils/clipboard";
import { filenameToId } from "../../../utils/id";
import { getNoteConfigFromUrl } from "../../../utils/url";

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
