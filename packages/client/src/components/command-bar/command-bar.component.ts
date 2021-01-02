import { ComponentReferenceService } from "../../services/component-reference/component-reference.service";
import { FileStorageService } from "../../services/file-storage/file-storage.service";
import { ProxyService } from "../../services/proxy/proxy.service";
import { SourceControlService } from "../../services/source-control/source-control.service";
import { WindowBridgeService } from "../../services/window-bridge/window-bridge.service";
import { di } from "../../utils/dependency-injector";
import { idToFilename } from "../../utils/id";
import "./command-bar.css";
import { commandTree } from "./command-tree";
import { commandHandlers } from "./commands";
import { MenuRowComponent } from "./menu/menu-row.component";
import { renderChildCommands } from "./menu/render-menu";

customElements.define("s2-menu-row", MenuRowComponent);

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
  windowBridge = di.getSingleton(WindowBridgeService);

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
      const activeOption = this.commandOptionsDom.querySelector(
        `s2-menu-row[data-kind="option"][data-active]`
      ) as MenuRowComponent;
      if (activeOption) {
        const handled = this.handleOptionKeydown({ optionDom: activeOption, event: event });

        if (handled) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
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
          ...this.commandOptionsDom.querySelectorAll(`s2-menu-row[data-kind="option"]`),
        ] as MenuRowComponent[];
        let currentOptionIndex = allOptions.findIndex((option) => option.dataset.active === "");

        if (currentOptionIndex < 0) {
          currentOptionIndex = 0; // the input itself must be active when none of the options are active
        }

        const newIndex = (currentOptionIndex + (isGoUp ? allOptions.length - 1 : 1)) % allOptions.length;

        allOptions.forEach((option) => delete option.dataset.active);
        const newActiveOption = allOptions[newIndex];
        if (newActiveOption.dataset.kind === "option") {
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
      this.commandOptionsDom.innerHTML = renderChildCommands(command.commands);
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
  private handleOptionKeydown(props: { optionDom: MenuRowComponent; event: KeyboardEvent }): boolean {
    const targetDataset = props.optionDom.dataset;
    const e = props.event;

    if (e.key === "Enter") {
      if (targetDataset.commandKey) {
        this.commandInputDom.value = this.commandInputDom.value + targetDataset.commandKey;
        this.handleInput(this.commandInputDom.value);

        return true;
      }

      if (targetDataset.openUrl) {
        const shouldOpenInNew = e.ctrlKey || targetDataset.alwaysNewTab === "true";
        window.open(targetDataset.openUrl, shouldOpenInNew ? "_blank" : "_self");

        this.exitCommandMode();

        return true;
      }

      if (targetDataset.openNoteById) {
        window.open(`/?filename=${idToFilename(targetDataset.openNoteById)}`, e.ctrlKey ? "_blank" : "_self");
        this.exitCommandMode();

        return true;
      }

      if (targetDataset.insertText) {
        this.componentRefs.textEditor.insertAtCursor(targetDataset.insertText);
        this.componentRefs.statusBar.setMessage(`[command-bar] inserted "${targetDataset.insertText}"`);
        this.exitCommandMode();

        return true;
      }

      if (targetDataset.insertOnSave) {
        this.windowBridge.insertNoteLinkAfterCreated(targetDataset.insertOnSave);
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
          windowBridgeService: this.windowBridge,
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
