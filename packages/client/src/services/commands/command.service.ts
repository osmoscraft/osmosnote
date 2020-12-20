export interface CommandInput {
  command: string;
  args: string[];
}

export const EMPTY_COMMAND: CommandInput = {
  command: "",
  args: [],
};

export interface RegisteredCommand {
  name: string;
  key: string;
  commands?: RegisteredCommand[];
}

export const commandTree: RegisteredCommand = {
  name: "All commands",
  key: "",
  commands: [
    {
      name: "Insert",
      key: "i",
      commands: [
        {
          name: "Note link",
          key: "n",
        },
        {
          name: "Tag",
          key: "t",
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
        },
      ],
    },
  ],
};

export class CommandSerivce {
  private matchedCommand: RegisteredCommand | null = commandTree;

  handleInput(input: string) {
    const currentInput = this.parseInput(input);
    this.matchedCommand = this.matchCommand(currentInput);
  }

  getMatchedCommand() {
    // TODO if there is a perfect match, delegate options to the command providers
    // show suggestions based on prefix match
    return this.matchedCommand;
  }

  private parseInput(input: string): CommandInput {
    const command = input.split(" ")[0];
    const args = input.split(" ").slice(1);

    return {
      command,
      args,
    };
  }

  private matchCommand(input: CommandInput): RegisteredCommand | null {
    let currentCommand = commandTree;

    const chars = input.command.split("");

    for (let char of chars) {
      const childMatch = currentCommand.commands?.find((c) => c.key === char);
      if (!childMatch) {
        return null;
      }

      currentCommand = childMatch;
    }

    return currentCommand;
  }
}
