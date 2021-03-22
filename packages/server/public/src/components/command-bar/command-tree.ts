import type { RegisteredCommand } from "./command-bar.component.js";
import { handleInsertNote } from "./commands/handle-insert-note.js";
import { handleInsertTags } from "./commands/handle-insert-tags.js";
import { handleLinkToNote } from "./commands/handle-link-to-note.js";
import { handleOpenOrCreateNote } from "./commands/handle-open-note.js";
import { handleFileVersionCheckAll } from "./commands/handle-file-version-check-all.js";
import { handleVersionSyncAll } from "./commands/handle-file-version-sync-all.js";
import { handleFileSave } from "./commands/handle-file-save.js";
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
          name: "Check versions",
          key: "v",
          handler: handleFileVersionCheckAll,
        },
        {
          name: "Sync versions",
          key: "a",
          handler: handleVersionSyncAll,
        },
      ],
    },
    {
      name: "Settings",
      key: "s",
      commands: [
        {
          name: "Toggle spellcheck",
          key: "l",
          handler: handleToggleSpellcheck,
        },
      ],
    },
  ],
};
