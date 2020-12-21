import type { RegisteredCommand } from "./command-bar.component";

export const commandTree: RegisteredCommand = {
  name: "All commands",
  key: "",
  commands: [
    {
      name: "Note",
      key: "n",
      commands: [
        {
          name: "Get link",
          key: "k",
          executeOnComplete: true,
        },
      ],
    },
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
          name: "Save",
          key: "s",
          executeOnComplete: true,
        },
      ],
    },
  ],
};
