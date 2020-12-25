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
          name: "Save",
          key: "s",
          executeOnComplete: true,
        },
      ],
    },
    {
      name: "Search",
      key: "s",
      requireArguments: true,
    },
    {
      name: "Copy slash",
      key: "/",
      executeOnComplete: true,
    },
  ],
};
