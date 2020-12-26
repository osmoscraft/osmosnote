import type {
  CreateNoteBody,
  CreateNoteReply,
  UpdateNoteBody,
  UpdateNoteReply,
} from "@system-two/server/src/routes/note";
import type { CommandHandler } from ".";
import { filenameToId } from "../../../lib/id";
import { getNoteConfigFromUrl } from "../../../lib/url";

export const handleFileSave: CommandHandler = async ({ command, context }) => {
  const { filename } = getNoteConfigFromUrl();
  if (!filename) {
    // Create new file
    const createNoteBody: CreateNoteBody = {
      note: {
        metadata: {
          title: context.componentRefs.documentHeader.getTitle(),
        },
        content: context.componentRefs.contentHost.getMarkdown(),
      },
    };

    const response = await fetch(`/api/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createNoteBody),
    });

    const result: CreateNoteReply = await response.json();

    history.replaceState(undefined, document.title, `/?filename=${result.filename}`);
    context.componentRefs.statusBar.showText(`Created ${result.note.metadata.title}`);

    return {};
  } else {
    // Update existing file

    // save changes to note
    const updateNoteBody: UpdateNoteBody = {
      note: {
        metadata: {
          title: context.componentRefs.documentHeader.getTitle(),
        },
        content: context.componentRefs.contentHost.getMarkdown(),
      },
    };

    const id = filenameToId(filename);

    const response = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateNoteBody),
    });
    const result: UpdateNoteReply = await response.json();

    context.componentRefs.statusBar.showText(`Saved ${result.note.metadata.title}`);
    return {};
  }
};