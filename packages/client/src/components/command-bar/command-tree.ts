import type { RegisteredCommand } from "./command-bar.component";

export const commandTree: RegisteredCommand = {
  name: "All commands",
  key: "",
  commands: [
    {
      name: "File",
      key: "f",
      commands: [
        {
          name: "Copy (yank) link",
          key: "y",
          executeOnComplete: true,
        },
        {
          name: "Open",
          key: "o",
          requireArguments: true,
        },
        {
          name: "Format",
          key: "f",
          executeOnComplete: true,
        },
        {
          name: "Save",
          key: "s",
          executeOnComplete: true,
        },
        {
          name: "Save and sync all",
          key: "a",
          executeOnComplete: true,
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
          requireArguments: true,
        },
        {
          name: "URL",
          key: "l",
          requireArguments: true,
        },
        {
          name: "Slash",
          key: "/",
          executeOnComplete: true,
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
          executeOnComplete: true,
        },
        {
          name: "check",
          key: "c",
          executeOnComplete: true,
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
          executeOnComplete: true,
        },
        {
          name: "References",
          key: "r",
          executeOnComplete: true,
        },
        {
          name: "Editor",
          key: "e",
          executeOnComplete: true,
        },
      ],
    },
  ],
};
