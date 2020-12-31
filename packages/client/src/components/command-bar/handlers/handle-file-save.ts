import type { CreateNoteBody, UpdateNoteBody } from "@system-two/server/src/routes/note";
import type { CommandHandler, CommandHandlerContext } from ".";
import { filenameToId } from "../../../utils/id";
import { getNoteConfigFromUrl } from "../../../utils/url";
import { handleVersionsCheck } from "./handle-versions-check";
import { handleVersionsSync } from "./handle-versions-sync";

export const handleFileSave: CommandHandler = async ({ input, context }) => {
  context.componentRefs.statusBar.showText("Saving…");

  upsertFile(context).then(() => {
    handleVersionsCheck({ input, context });
  });

  return {};
};

export const handleFileSaveAndSync: CommandHandler = async ({ input, context }) => {
  context.componentRefs.statusBar.showText("Saving…");

  upsertFile(context).then((result) => {
    handleVersionsSync({ input, context });
  });

  return {};
};

async function upsertFile(context: CommandHandlerContext) {
  const { filename } = getNoteConfigFromUrl();
  if (!filename) {
    // Create new file
    const createNoteBody: CreateNoteBody = {
      note: {
        metadata: context.componentRefs.documentHeader.getData(),
        content: context.componentRefs.textEditor.getFileText(),
      },
    };

    const result = await context.fileStorageService.create(createNoteBody);

    history.replaceState(undefined, document.title, `/?filename=${result.filename}`);
    context.componentRefs.statusBar.showText(`Created ${result.note.metadata.title}`);

    return result;
  } else {
    // Update existing file

    // save changes to note
    const updateNoteBody: UpdateNoteBody = {
      note: {
        metadata: context.componentRefs.documentHeader.getData(),
        content: context.componentRefs.textEditor.getFileText(),
      },
    };

    const id = filenameToId(filename);
    const result = await context.fileStorageService.update(id, updateNoteBody);

    context.componentRefs.statusBar.showText(`Saved ${result.note.metadata.title}`);

    return result;
  }
}
