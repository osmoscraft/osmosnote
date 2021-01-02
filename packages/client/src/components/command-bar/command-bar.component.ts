import { ComponentReferenceService } from "../../services/component-reference/component-reference.service";
import { FileStorageService } from "../../services/file-storage/file-storage.service";
import { ProxyService } from "../../services/proxy/proxy.service";
import { SourceControlService } from "../../services/source-control/source-control.service";
import { di } from "../../utils/dependency-injector";
import { idToFilename } from "../../utils/id";
import "./command-bar.css";
import { commandTree } from "./command-tree";
import { commandHandlers } from "./handlers";

declare global {
  interface GlobalEventHandlersEventMap {
    "command-bar:child-note-created": CustomEvent<ChildNoteCreated>;
  }
}

export interface ChildNoteCreated {
  id: string;
  title: string;
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
  commands?: RegisteredCommand[];
}

export class CommandBarComponent extends HTMLElement {
  readonly dataset!: {
    active?: "true";
  };

  commandInputDom!: HTMLInputElement;
  commandOptionsDom!: HTMLElement;
  commandTree!: RegisteredCommand;

  componentRefs = di.getSingleton(ComponentReferenceService);
  sourceControlService = di.getSingleton(SourceControlService);
  fileStorageService = di.getSingleton(FileStorageService);
  proxyService = di.getSingleton(ProxyService);

  private triggeringElement: Element | null = null;

  constructor() {
    super();

    this.commandTree = commandTree;
  }

  connectedCallback() {
    this.innerHTML = /*html*/ `
      <input id="command-input" class="cmdbr-input" disabled tabindex="-1" type="text" autocomplete="off" spellcheck="false" data-active/>
      <div id="command-options" class="cmdbr-dropdown"></div>`;

    this.commandInputDom = document.getElementById("command-input") as HTMLInputElement;
    this.commandOptionsDom = document.getElementById("command-options") as HTMLUListElement;

    this.handleEvents();
  }

  enterCommandMode() {
    this.saveCurosr();
    this.dataset.active = "true";

    this.commandInputDom.tabIndex = 0; // make it focusable AFTER command mode starts. Otherwise, we will trap focus for the rest of the window
    this.commandInputDom.disabled = false;

    this.commandInputDom.focus();
  }

  exitCommandMode() {
    this.clear();

    delete this.dataset.active;
    this.commandInputDom.tabIndex = -1;
    this.commandInputDom.disabled = true;

    this.restoreCursor();
  }

  isInCommandMode() {
    return document.activeElement === this.commandInputDom;
  }

  clear() {
    this.commandInputDom.value = "";
    this.commandOptionsDom.innerHTML = "";
  }

  private saveCurosr() {
    this.triggeringElement = document.activeElement;
  }

  private restoreCursor() {
    (this.triggeringElement as HTMLElement)?.focus?.();
  }

  private parseInput(input: string): CommandInput {
    const command = input.split(" ")[0];
    const args = input.split(" ").slice(1).join(" ");

    return {
      command,
      args,
    };
  }

  private handleEvents() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "/") {
        if (this.isInCommandMode()) return; // Don't handle it if it's alreay active

        event.stopPropagation();
        event.preventDefault();

        this.enterCommandMode();
      }
    });

    this.addEventListener("focusout", (event) => {
      if (this.contains(event.relatedTarget as Node)) return;

      this.exitCommandMode();
    });

    this.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        this.exitCommandMode();
      }
    });

    this.commandInputDom.addEventListener("focus", (event) => {
      this.handleInput(this.commandInputDom.value);
    });

    this.commandInputDom.addEventListener("keydown", async (event) => {
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

      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();

        const isGoUp = event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey);

        const allOptions = [
          this.commandInputDom,
          ...this.commandOptionsDom.querySelectorAll("[data-option]"),
        ] as HTMLElement[];
        let currentOptionIndex = allOptions.findIndex((option) => option.dataset.active === "");

        if (currentOptionIndex < 0) {
          currentOptionIndex = 0; // the input itself must be active when none of the options are active
        }

        const newIndex = (currentOptionIndex + (isGoUp ? allOptions.length - 1 : 1)) % allOptions.length;

        allOptions.forEach((option) => delete option.dataset.active);
        const newActiveOption = allOptions[newIndex];
        if (newActiveOption.dataset.option === "") {
          // filter out the input element
          newActiveOption.dataset.active = "";
        }
      }

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();

        const executableCommand = await this.buildCommand();
        if (executableCommand?.runOnCommit) {
          this.exitCommandMode();
          executableCommand.runOnCommit();
        }
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
            /*html*/ `<div data-command-key="${command.key}" data-option class="cmdbr-dropdown-row cmdbr-dropdown-row--btn">[${command.key}] ${command.name}</div>`
        )
        .join("");
      this.commandOptionsDom.innerHTML = optionsView;
      return;
    }

    const executableCommand = await this.buildCommand();
    if (!executableCommand) return;

    if (executableCommand.runOnMatch) {
      this.exitCommandMode();

      executableCommand.runOnMatch();
      return;
    }

    if (executableCommand.updateDropdownOnInput) {
      const dropdownHtml = await executableCommand.updateDropdownOnInput();

      // it is possible the dropdown html arrives after the user commits the query
      if (this.isInCommandMode()) {
        this.commandOptionsDom.innerHTML = dropdownHtml;
      }
    }

    // add auto trailing space
    if (input.indexOf(" ") < 0) {
      this.commandInputDom.value = `${this.commandInputDom.value} `;
    }
  }

  /**
   * @return {boolean} whether the processing should stop after
   */
  private handleOptionKeydown(optionDom: HTMLElement, e: KeyboardEvent): boolean {
    const targetDataset = optionDom.dataset;

    if (e.key === "Enter") {
      if (targetDataset.commandKey) {
        e.stopPropagation();
        e.preventDefault();

        this.commandInputDom.value = this.commandInputDom.value + targetDataset.commandKey;
        this.handleInput(this.commandInputDom.value);

        return true;
      }

      if (targetDataset.openUrl) {
        e.stopPropagation();
        e.preventDefault();

        window.open(targetDataset.openUrl, e.ctrlKey || targetDataset.alwaysNewTab === "true" ? undefined : "_self");
        this.exitCommandMode();

        return true;
      }

      if (targetDataset.openNoteById) {
        e.stopPropagation();
        e.preventDefault();

        window.open(`/?filename=${idToFilename(targetDataset.openNoteById)}`, e.ctrlKey ? undefined : "_self");
        this.exitCommandMode();

        return true;
      }

      if (targetDataset.insertText) {
        e.stopPropagation();
        e.preventDefault();

        this.componentRefs.textEditor.insertAtCursor(targetDataset.insertText);
        this.componentRefs.statusBar.setMessage(`[command-bar] inserted "${targetDataset.insertText}"`);
        this.exitCommandMode();

        return true;
      }

      if (targetDataset.insertOnSave) {
        e.stopPropagation();
        e.preventDefault();

        this.componentRefs.statusBar.setMessage("Save child note to insert, [ESC] to cancel", "warning");

        const handleChildNoteCreated = (ev: CustomEvent<ChildNoteCreated>) => {
          const insertion = `[${ev.detail.title}](${ev.detail.id})`;

          this.componentRefs.textEditor.insertAtCursor(insertion);
          this.componentRefs.statusBar.setMessage(`Inserted: "${insertion}"`);
          window.removeEventListener("command-bar:child-note-created", handleChildNoteCreated);
          window.removeEventListener("keydown", handleCancel);
        };

        const handleCancel = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            window.removeEventListener("command-bar:child-note-created", handleChildNoteCreated);
            window.removeEventListener("keydown", handleCancel);
            this.componentRefs.statusBar.setMessage(`Cancelled`);
            console.log("[command-bar] cancelled handling child note created");
          }
        };

        window.addEventListener("command-bar:child-note-created", handleChildNoteCreated);
        window.addEventListener("keydown", handleCancel, { capture: true });

        window.open(targetDataset.insertOnSave);
        this.exitCommandMode();

        return true;
      }
    }

    return false;
  }

  private async buildCommand() {
    const currentInput = this.parseInput(this.commandInputDom.value);

    const handler = commandHandlers[currentInput.command];

    if (handler) {
      const result = await handler({
        input: currentInput,
        context: {
          componentRefs: this.componentRefs,
          fileStorageService: this.fileStorageService,
          sourceControlService: this.sourceControlService,
          proxyService: this.proxyService,
        },
      });

      return result;
    } else {
      return null;
    }
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
