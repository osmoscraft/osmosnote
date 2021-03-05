import type { RegisteredCommand } from "./command-bar.component.js";
import { handleCaptureNote } from "./commands/handle-capture-note.js";
import { handleInsertNote } from "./commands/handle-insert-note.js";
import { handleInsertTags } from "./commands/handle-insert-tags.js";
import { handleInsertUrl } from "./commands/handle-insert-url.js";

export const commandTree: RegisteredCommand = {
  name: "All commands",
  key: "",
  commands: [
    {
      name: "Search",
      key: "s",
      commands: [
        {
          name: "Note",
          key: "n",
          handler: handleCaptureNote,
        },
        {
          name: "URL",
          key: "l",
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
      name: "Insert",
      key: "i",
      commands: [
        {
          name: "Note",
          key: "n",
          handler: handleInsertNote,
        },
        {
          name: "URL",
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
      name: "Versions",
      key: "v",
      commands: [
        {
          name: "Sync",
          key: "s",
        },
        {
          name: "check",
          key: "c",
        },
      ],
    },
  ],
};
