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
      ],
    },
    {
      name: "Insert",
      key: "i",
      commands: [
        {
          name: "Slash",
          key: "/",
          executeOnComplete: true,
        },
        {
          name: "Link",
          key: "l",
          requireArguments: true,
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
      name: "Window",
      key: "w",
      commands: [
        {
          name: "Go to Header",
          key: "h",
          executeOnComplete: true,
        },
        {
          name: "Go to References",
          key: "r",
          executeOnComplete: true,
        },
        {
          name: "Go to Editor",
          key: "e",
          executeOnComplete: true,
        },
      ],
    },
  ],
};
