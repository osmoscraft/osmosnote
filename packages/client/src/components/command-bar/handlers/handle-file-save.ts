import type { UpdateNoteBody, UpdateNoteReply } from "@system-two/server/src/routes/note";
import type { CommandHandler } from ".";
import { filenameToId } from "../../../lib/id";
import { getNoteConfigFromUrl } from "../../../lib/url";

export const handleFileSave: CommandHandler = async ({ command, context }) => {
  // save changes to note
  const updateNoteBody: UpdateNoteBody = {
    note: {
      metadata: {
        title: context.titleDom.innerText,
      },
      content: context.contentHost.getMarkdown(),
    },
  };

  const { filename } = getNoteConfigFromUrl();
  if (!filename) {
    //TODO show error
    return {};
  }

  const id = filenameToId(filename);

  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateNoteBody),
  });
  const result: UpdateNoteReply = await response.json();

  context.statusBar.showText(`Saved ${result.note.metadata.title}`);
  return {};
};
