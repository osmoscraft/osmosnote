import type { RegisteredCommand } from "./command-bar.component.js";
import { handleInsertNote } from "./commands/handle-insert-note.js";
import { handleInsertTags } from "./commands/handle-insert-tags.js";
import { handleInsertUrl } from "./commands/handle-insert-url.js";
import { handleSearchNote } from "./commands/handle-search-note.js";
import { handleSearchUrl } from "./commands/handle-search-url.js";
import { handleVersionsCheck } from "./commands/handle-version-check.js";
import { handleVersionsSyncAndCheck } from "./commands/handle-version-sync-and-check.js";
import { handleVersionsSync } from "./commands/handle-version-sync.js";

export const commandTree: RegisteredCommand = {
  name: "All commands",
  key: "",
  commands: [
    {
      name: "Notes",
      key: "n",
      commands: [
        {
          name: "Search content",
          key: "n",
          handler: handleSearchNote,
        },
        {
          name: "Search URL",
          key: "l",
          handler: handleSearchUrl,
        },
      ],
    },
    {
      name: "Insert",
      key: "i",
      commands: [
        {
          name: "Note by content",
          key: "i",
          handler: handleInsertNote,
        },
        {
          name: "Note by URL",
          key: "l",
          handler: handleInsertUrl,
        },
        {
          name: "Tags",
          key: "t",
          handler: handleInsertTags,
        },
      ],
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
        },
        {
          name: "Sync all",
          key: "y",
        },
      ],
    },
    {
      name: "Versions",
      key: "v",
      commands: [
        {
          name: "Check",
          key: "c",
          handler: handleVersionsCheck,
        },
        {
          name: "Sync",
          key: "s",
          handler: handleVersionsSync,
        },
        {
          name: "Sync and view",
          key: "v",
          handler: handleVersionsSyncAndCheck,
        },
      ],
    },
  ],
};
