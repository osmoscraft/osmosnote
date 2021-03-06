import type { RegisteredCommand } from "./command-bar.component.js";
import { handleInsertNote } from "./commands/handle-insert-note.js";
import { handleInsertTags } from "./commands/handle-insert-tags.js";
import { handleLinkToNote } from "./commands/handle-link-to-note.js";
import { handleOpenOrCreateNote } from "./commands/handle-open-note.js";
import { handleVersionsCheck } from "./commands/handle-version-check.js";
import { handleVersionsSyncAndCheck } from "./commands/handle-version-sync-and-check.js";

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
          name: "Format",
          key: "f",
        },
        {
          name: "Save",
          key: "s",
          // TODO: handleSaveAndCheck
        },
        {
          name: "Check all",
          key: "v",
          handler: handleVersionsCheck,
        },
        {
          name: "Sync all",
          key: "a",
          handler: handleVersionsSyncAndCheck,
        },
      ],
    },
  ],
};
