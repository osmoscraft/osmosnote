import { emit } from "../../lib/events";
import { commandTree } from "./command-tree";
import "./command-bar.css";
import { commandHandlers } from "./handlers";
import type { ContentHostComponent } from "../content-host/content-host.component";
import type { StatusBarComponent } from "../status-bar/status-bar.component";

declare global {
  interface GlobalEventHandlersEventMap {
    "command-bar:did-cancel": CustomEvent<never>;
    "command-bar:did-execute": CustomEvent<never>;
  }
}

export interface CommandInput {
  command: string;
  args?: string;
}

export const EMPTY_COMMAND: CommandInput = {
  command: "",
};

export interface RegisteredCommand {
  name: string;
  key: string;
  executeOnComplete?: boolean;
  requireArguments?: boolean;
  commands?: RegisteredCommand[];
}

export class CommandBarComponent extends HTMLElement {
  contentHostDom!: ContentHostComponent;
  commandInputDom!: HTMLInputElement;
  commandOptionsDom!: HTMLElement;
  commandTree!: RegisteredCommand;
  statusBarDom!: StatusBarComponent;

  constructor() {
    super();

    this.commandTree = commandTree;
  }

  connectedCallback() {
    this.innerHTML = /*html*/ `
      <input id="command-input" class="cmdbr-input" type="text" autocomplete="off" spellcheck="false"/>
      <div id="command-options" class="cmdbr-options"></div>`;

    this.commandInputDom = document.getElementById("command-input") as HTMLInputElement;
    this.commandOptionsDom = document.getElementById("command-options") as HTMLUListElement;
    this.contentHostDom = document.querySelector("s2-content-host") as ContentHostComponent;
    this.statusBarDom = document.querySelector("s2-status-bar") as StatusBarComponent;

    this.handleEvents();
  }

  enterCommandMode() {
    this.commandInputDom.focus();
  }

  clear() {
    this.commandInputDom.value = "";
    this.commandOptionsDom.innerHTML = "";
  }

  private parseInput(input: string): CommandInput {
    const command = input.split(" ")[0];
    const args = input.split(" ")[1];

    return {
      command,
      args,
    };
  }

  private handleEvents() {
    this.commandInputDom.addEventListener("focus", () => {
      this.handleInput("");
    });

    this.commandInputDom.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        // exit command
        this.clear();
        emit(this, "command-bar:did-cancel");
      }

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();

        this.executeCommand();
      }

      if (event.key === "Backspace") {
        // handle backspace manually when it's trailing the command name, otherwise, auto trailling space will be added immediately
        if (this.commandInputDom.value.indexOf(" ") === this.commandInputDom.value.length - 1) {
          this.commandInputDom.value = this.commandInputDom.value.trimEnd();
          event.preventDefault();
          event.stopPropagation();
        }
      }
    });

    this.commandInputDom.addEventListener("input", async (e) => {
      this.handleInput((e.target as HTMLInputElement).value);
    });

    this.commandOptionsDom.addEventListener("click", (e) => {
      // commit command options
    });
  }

  private async handleInput(input: string) {
    const currentInput = this.parseInput(input);
    const command = this.matchCommand(currentInput);

    // command has child commands, render options
    if (command?.commands?.length) {
      const optionsView = command.commands
        ?.map(
          (command) =>
            /*html*/ `<button class="cmdbr-option cmdbr-option--btn">[${command.key}] ${command.name}</button>`
        )
        .join("");
      this.commandOptionsDom.innerHTML = optionsView;
      return;
    }

    // command has no child commands, and should execute and exit
    if (command?.executeOnComplete) {
      this.executeCommand();
      return;
    }

    // add auto trailing space when arguments are required
    if (command?.requireArguments && input.indexOf(" ") < 0) {
      this.commandInputDom.value = `${this.commandInputDom.value} `;
    }

    // command has no child commands, and should render options based on arguments
    this.updateCommandOptions();
  }

  private async updateCommandOptions() {
    const currentInput = this.parseInput(this.commandInputDom.value);

    const handler = commandHandlers[currentInput.command];

    if (typeof handler === "function") {
      const result = await handler({
        command: currentInput,
        context: {
          contentHost: this.contentHostDom,
          statusBar: this.statusBarDom,
          titleDom: document.getElementById("note-title") as HTMLElement, // TODO refactor away
        },
      });
      if (result.optionsHtml) {
        this.commandOptionsDom.innerHTML = result.optionsHtml;
      }
    }
  }

  private async executeCommand() {
    const currentInput = this.parseInput(this.commandInputDom.value);

    const handler = commandHandlers[currentInput.command];

    if (typeof handler === "function") {
      await handler({
        command: currentInput,
        execute: true,
        context: {
          contentHost: this.contentHostDom,
          statusBar: this.statusBarDom,
          titleDom: document.getElementById("note-title") as HTMLElement, // TODO refactor away
        },
      });
    }

    this.clear();

    emit(this, "command-bar:did-execute");
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

customElements.define("s2-command-bar", CommandBarComponent);
