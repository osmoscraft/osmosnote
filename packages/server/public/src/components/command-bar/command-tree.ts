import type { RegisteredCommand } from "./command-bar.component.js";
import { handleFileDelete } from "./commands/handle-file-delete.js";
import { handleFileFormat } from "./commands/handle-file-format.js";
import { handleFileSaveAndSyncAll } from "./commands/handle-file-save-and-sync-all.js";
import { handleFileSave } from "./commands/handle-file-save.js";
import { handleFileSyncAll } from "./commands/handle-file-sync-all.js";
import { handleInsertNote } from "./commands/handle-insert-note.js";
import { handleInsertTags } from "./commands/handle-insert-tags.js";
import { handleLinkToNote } from "./commands/handle-link-to-note.js";
import { handleOpenOrCreateNote } from "./commands/handle-open-note.js";
import { handleOpenSettings } from "./commands/handle-open-settings.js";
import { handleShutdown } from "./commands/handle-shutdown.js";
import { handleToggleSpellcheck } from "./commands/handle-toggle-spellcheck.js";

export const commandTree: RegisteredCommand = {
  name: "All commands",
  key: "",
  commands: [
    {
      name: "Open or new note",
      key: "o",
      handler: handleOpenOrCreateNote,
    },
    {
      name: "Insert note",
      key: "i",
      handler: handleInsertNote,
    },
    {
      name: "Add tag",
      key: "t",
      handler: handleInsertTags,
    },
    {
      name: "Link to note",
      key: "k",
      handler: handleLinkToNote,
    },
    {
      name: "File",
      key: "f",
      commands: [
        {
          name: "Save",
          key: "s",
          handler: handleFileSave,
        },
        {
          name: "Sync",
          key: "y",
          handler: handleFileSyncAll,
        },
        {
          name: "Save and sync all",
          key: "a",
          handler: handleFileSaveAndSyncAll,
        },
        {
          name: "Delete",
          key: "q",
          handler: handleFileDelete,
        },
        {
          name: "Format",
          key: "f",
          handler: handleFileFormat,
        },
      ],
    },
    {
      name: "Settings",
      key: "s",
      commands: [
        {
          name: "Open settings page",
          key: "s",
          handler: handleOpenSettings,
        },
        {
          name: "Toggle spellcheck",
          key: "l",
          handler: handleToggleSpellcheck,
        },
      ],
    },
    {
      name: "Shutdown",
      key: "q",
      handler: handleShutdown,
    },
  ],
};
