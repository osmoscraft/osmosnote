import { CommandSerivce } from "../../services/commands/command.service";

export class CommandBarComponent extends HTMLElement {
  commandInputDom!: HTMLInputElement;
  commandOptionsDom!: HTMLElement;

  constructor(private commandService: CommandSerivce) {
    super();

    this.commandService = new CommandSerivce();
  }

  connectedCallback() {
    this.innerHTML = /*html*/ `
      <input id="command-input" type="text"/>
      <ul id="command-options"></ul>`;

    this.commandInputDom = document.getElementById("command-input") as HTMLInputElement;
    this.commandOptionsDom = document.getElementById("command-options") as HTMLUListElement;

    this.handleEvents();
  }

  public enterCommandMode() {
    this.commandInputDom.focus();
  }

  private handleEvents() {
    this.commandInputDom.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        // exit command
      }

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();

        // commit command
      }
    });

    this.commandInputDom.addEventListener("input", async (e) => {
      // input = [command] [...args]
      // if no command matches, suggest matchable commands based on prefix
      // if prefix matches a command, rest of input is argument, delegate to command to handle

      this.commandService.handleInput((e.target as HTMLInputElement).value);
      const command = this.commandService.getMatchedCommand();
      const optionsView =
        command?.commands?.map((command) => `<pre>[${command.key}] ${command.name}<pre>`).join("") ?? "empty";
      this.commandOptionsDom.innerHTML = optionsView;

      console.log(command);
      //
      // 1. update active command (stateful)
      // 2. update options
    });

    this.commandOptionsDom.addEventListener("click", (e) => {
      // commit command options
    });
  }
}

customElements.define("s2-command-bar", CommandBarComponent);
