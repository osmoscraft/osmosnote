import type { RegisteredCommand } from "./command-bar.component";

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
          requireArguments: true,
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
          executeOnComplete: true,
        },
        {
          name: "Save",
          key: "s",
          executeOnComplete: true,
        },
      ],
    },
  ],
};
