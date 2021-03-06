import type { RegisteredCommand } from "./command-bar.component.js";
import { handleInsertNote } from "./commands/handle-insert-note.js";
import { handleInsertTags } from "./commands/handle-insert-tags.js";
import { handleOpenOrCreateNote } from "./commands/handle-open-note.js";
import { handleVersionsCheck } from "./commands/handle-version-check.js";
import { handleVersionsSyncAndCheck } from "./commands/handle-version-sync-and-check.js";

export const commandTree: RegisteredCommand = {
  name: "All commands",
  key: "",
  commands: [
    {
      name: "Open or new",
      key: "n",
      handler: handleOpenOrCreateNote,
    },
    {
      name: "Insert",
      key: "i",
      commands: [
        {
          name: "Note",
          key: "n",
          handler: handleInsertNote,
        },
        {
          name: "Tags",
          key: "t",
          handler: handleInsertTags,
        },
      ],
    },
    {
      name: "Link selection to",
      key: "k",
      commands: [],
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
