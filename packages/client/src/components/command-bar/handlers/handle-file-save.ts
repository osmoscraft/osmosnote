import type { CreateNoteBody, UpdateNoteBody } from "@system-two/server/src/routes/note";
import type { CommandHandler, CommandHandlerContext } from ".";
import { filenameToId } from "../../../utils/id";
import { getNoteConfigFromUrl } from "../../../utils/url";
import { handleVersionsCheck } from "./handle-versions-check";
import { handleVersionsSync } from "./handle-versions-sync";

export const handleFileSave: CommandHandler = async ({ input, context }) => ({
  onExecute: async () => {
    context.componentRefs.statusBar.setMessage("Saving…");

    try {
      await upsertFile(context);
      context.componentRefs.textEditor.markModelAsSaved();
      handleVersionsCheck({ input, context });
    } catch (error) {
      context.componentRefs.statusBar.setMessage(`Error saving note`, "error");
    }
  },
});

export const handleFileSaveAndSync: CommandHandler = async ({ input, context }) => ({
  onExecute: async () => {
    context.componentRefs.statusBar.setMessage("Saving…");

    try {
      await upsertFile(context);
      context.componentRefs.textEditor.markModelAsSaved();
      handleVersionsSync({ input, context });
    } catch (error) {
      context.componentRefs.statusBar.setMessage(`Error saving note`, "error");
    }
  },
});

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
    context.componentRefs.statusBar.setMessage(`Created ${result.note.metadata.title}`);

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

    context.componentRefs.statusBar.setMessage(`Saved ${result.note.metadata.title}`);

    return result;
  }
}
