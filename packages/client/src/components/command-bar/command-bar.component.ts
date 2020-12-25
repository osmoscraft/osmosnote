import { emit } from "../../lib/events";
import { commandTree } from "./command-tree";
import "./command-bar.css";
import { commandHandlers } from "./handlers";
import type { ContentHostComponent } from "../content-host/content-host.component";
import type { StatusBarComponent } from "../status-bar/status-bar.component";
import { sendToClipboard } from "../../lib/clipboard";
import { idToFilename } from "../../lib/id";
import { saveRange } from "../../lib/curosr";
import type { DocumentHeaderComponent } from "../document-header/document-header.component";

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
  documentHeaderDom!: DocumentHeaderComponent;
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
    this.documentHeaderDom = document.querySelector("s2-document-header") as DocumentHeaderComponent;
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
    // this component never disconnect, otherwise, we need to clean up window listeners
    window.addEventListener("keydown", (event) => {
      if (event.key === "/") {
        if (document.activeElement === this.commandInputDom) return; // Don't handle it if it's alreay active

        event.stopPropagation();
        event.preventDefault();

        saveRange();
        this.enterCommandMode();
      }
    });

    this.addEventListener("focusout", (event) => {
      if (this.contains(event.relatedTarget as Node)) return;
      this.commandOptionsDom.innerHTML = "";
    });

    this.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        // exit command
        this.clear();
        emit(this, "command-bar:did-cancel");
      }
    });

    this.commandInputDom.addEventListener("focus", () => {
      this.handleInput(this.commandInputDom.value);
    });

    this.commandInputDom.addEventListener("keydown", (event) => {
      const activeOption = this.commandOptionsDom.querySelector("[data-option][data-active]") as HTMLElement;
      if (activeOption) {
        const handled = this.handleOptionKeydown(activeOption, event);
        if (handled) return;
      }

      if (event.key === "Backspace") {
        // handle backspace manually when it's trailing the command name, otherwise, auto trailling space will be added immediately
        if (this.commandInputDom.value.indexOf(" ") === this.commandInputDom.value.length - 1) {
          this.commandInputDom.value = this.commandInputDom.value.trimEnd();
          event.preventDefault();
          event.stopPropagation();
        }
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();

        const currentOption = this.commandOptionsDom.querySelector("[data-option][data-active]") as HTMLElement;
        if (currentOption) {
          const candidateOption =
            event.key === "ArrowDown" ? currentOption.nextElementSibling : currentOption.previousElementSibling;
          if (candidateOption?.matches("[data-option")) {
            (candidateOption as HTMLElement).dataset.active = "";
            delete currentOption.dataset.active;
          } else {
            // overflow, reset to input
            delete currentOption.dataset.active;
          }
        } else {
          const options = [...this.commandOptionsDom.querySelectorAll("[data-option]")] as HTMLElement[];
          const candidateOption = options[event.key === "ArrowDown" ? 0 : options.length - 1];
          if (candidateOption) {
            candidateOption.dataset.active = "";
          }
        }
      }

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();

        this.executeCommand();
      }
    });

    this.commandInputDom.addEventListener("input", async (e) => {
      this.handleInput((e.target as HTMLInputElement).value);
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
            /*html*/ `<div data-command-key="${command.key}" data-option class="cmdbr-option cmdbr-option--btn">[${command.key}] ${command.name}</div>`
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

  /**
   * @return {boolean} whether the processing should stop after
   */
  private handleOptionKeydown(optionDom: HTMLElement, e: KeyboardEvent): boolean {
    const targetDataset = optionDom.dataset;

    if (targetDataset.copyText && e.key === "y") {
      e.stopPropagation();
      e.preventDefault();

      sendToClipboard(targetDataset.copyText);
      this.statusBarDom.showText(`[command-bar] copied "${targetDataset.copyText}"`);
      this.clear();
      emit(this, "command-bar:did-execute");

      return true;
    }

    if (e.key === "Enter") {
      if (targetDataset.commandKey) {
        this.commandInputDom.value = this.commandInputDom.value + targetDataset.commandKey;
        this.handleInput(this.commandInputDom.value);

        return true;
      }

      if (targetDataset.openById) {
        window.open(`/editor.html?filename=${idToFilename(targetDataset.openById)}`, e.ctrlKey ? undefined : "_self");
        this.clear();
        emit(this, "command-bar:did-execute");

        return true;
      }
    }

    return false;
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
          documentHeader: this.documentHeaderDom,
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
          documentHeader: this.documentHeaderDom,
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
