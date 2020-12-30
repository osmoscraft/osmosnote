import type { CreateNoteBody, UpdateNoteBody } from "@system-two/server/src/routes/note";
import type { CommandHandler } from ".";
import { filenameToId } from "../../../utils/id";
import { getNoteConfigFromUrl } from "../../../utils/url";
import { handleVersionsSync } from "./handle-versions-sync";

export const handleFileSave: CommandHandler = async ({ input, context }) => {
  const { filename } = getNoteConfigFromUrl();
  if (!filename) {
    // Create new file
    const createNoteBody: CreateNoteBody = {
      note: {
        metadata: {
          title: context.componentRefs.documentHeader.getTitle(),
        },
        content: context.componentRefs.textEditor.getFileText(),
      },
    };

    const result = await context.fileStorageService.create(createNoteBody);

    history.replaceState(undefined, document.title, `/?filename=${result.filename}`);
    context.componentRefs.statusBar.showText(`Created ${result.note.metadata.title}`);
  } else {
    // Update existing file

    // save changes to note
    const updateNoteBody: UpdateNoteBody = {
      note: {
        metadata: {
          title: context.componentRefs.documentHeader.getTitle(),
        },
        content: context.componentRefs.textEditor.getFileText(),
      },
    };

    const id = filenameToId(filename);
    const result = await context.fileStorageService.update(id, updateNoteBody);

    context.componentRefs.statusBar.showText(`Saved ${result.note.metadata.title}`);
  }

  if (input.command === "fa") {
    return handleVersionsSync({ input, context });
  }

  return {};
};
