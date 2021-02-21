import type { RegisteredCommand } from "./command-bar.component.js";
import { handleCaptureNote } from "./commands/handle-capture-note.js";

export const commandTree: RegisteredCommand = {
  name: "All commands",
  key: "",
  commands: [
    {
      name: "New",
      key: "n",
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
          name: "Copy (yank) link",
          key: "y",
        },
        {
          name: "Open",
          key: "o",
        },
        {
          name: "Format",
          key: "f",
        },
        {
          name: "Save",
          key: "s",
        },
        {
          name: "Save and sync all",
          key: "a",
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
        },
        {
          name: "URL",
          key: "l",
        },
        {
          name: "Tags",
          key: "t",
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
    {
      name: "Go to",
      key: "g",
      commands: [
        {
          name: "Header",
          key: "h",
        },
        {
          name: "References",
          key: "r",
        },
        {
          name: "Editor",
          key: "e",
        },
      ],
    },
  ],
};
