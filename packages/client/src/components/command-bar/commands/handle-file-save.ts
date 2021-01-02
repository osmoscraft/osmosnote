import type { CreateNoteBody, UpdateNoteBody } from "@system-two/server/src/routes/note";
import type { CommandHandler, CommandHandlerContext } from ".";
import { filenameToId } from "../../../utils/id";
import { getNoteConfigFromUrl } from "../../../utils/url";

export const handleFileSave: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    context.componentRefs.statusBar.setMessage("Saving…");

    try {
      await upsertFile(context);
      context.componentRefs.textEditor.markModelAsSaved();

      context.componentRefs.statusBar.setMessage("Checking…");
      const result = await context.sourceControlService.check();
      context.componentRefs.statusBar.setMessage(result.message);
    } catch (error) {
      context.componentRefs.statusBar.setMessage(`Error saving note`, "error");
    }
  },
});

export const handleFileSaveAndSync: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    context.componentRefs.statusBar.setMessage("Saving…");

    try {
      await upsertFile(context);
      context.componentRefs.textEditor.markModelAsSaved();

      context.componentRefs.statusBar.setMessage("Syncing…");
      const result = await context.sourceControlService.sync();
      context.componentRefs.statusBar.setMessage(result.message);
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

    // TODO notify window opener
    context.windowBridgeService.notifyNoteCreated({
      id: filenameToId(result.filename),
      title: result.note.metadata.title,
    });

    // TODO update new id in metadata

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
