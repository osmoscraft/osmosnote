export class CommandBarComponent extends HTMLElement {
  commandInputDom!: HTMLInputElement;
  commandOptionsDom!: HTMLElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `
      <input id="command-input" class="cmdbr-input" disabled tabindex="-1" type="text" autocomplete="off" spellcheck="false" data-active/>
      <div id="command-options" class="cmdbr-dropdown"></div>`;

    this.commandInputDom = document.getElementById("command-input") as HTMLInputElement;
    this.commandOptionsDom = document.getElementById("command-options") as HTMLUListElement;
  }
}
