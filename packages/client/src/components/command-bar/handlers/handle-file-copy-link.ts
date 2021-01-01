import type { CommandHandler } from ".";
import { sendToClipboard } from "../../../utils/clipboard";
import { filenameToId } from "../../../utils/id";
import { getNoteConfigFromUrl } from "../../../utils/url";

export const handleFileCopyLink: CommandHandler = ({ context }) => {
  return {
    onExecute: () => {
      const { filename } = getNoteConfigFromUrl();
      const title = context.componentRefs.documentHeader.getTitle();

      if (filename) {
        const link = `[${title}](${filenameToId(filename)})`;

        sendToClipboard(link);
        context.componentRefs.statusBar.setMessage(`Copied: ${link}`);
      } else {
        context.componentRefs.statusBar.setMessage(`Cannot copy unsaved note`, "warning");
      }
    },
  };
};
