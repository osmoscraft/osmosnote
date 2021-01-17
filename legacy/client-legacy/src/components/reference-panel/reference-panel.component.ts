import type { IncomingConnection } from "@system-two/server/src/routes/note";
import "./reference-panel.css";

export class ReferencePanelComponent extends HTMLElement {
  listDom!: HTMLUListElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<ul id="refpnl-list" class="refpnl-list"></ul>`;

    this.listDom = this.querySelector("#refpnl-list") as HTMLUListElement;

    this.handleEvents();
  }

  setIncomingConnections(notes: IncomingConnection[]) {
    this.listDom.innerHTML = notes
      .map(
        (note, index) => /*html*/ `
    <li>
      <a class="refpnl-link" data-index="${index}" tabindex="${index === 0 ? 0 : -1}" href="/?filename=${
          note.filename
        }">${note.title}</a>
    </li>
    `
      )
      .join("");
  }

  focusOnActiveLink() {
    const allLinks = [...this.querySelectorAll(`a[data-index]`)] as HTMLAnchorElement[];
    const activeLink = allLinks.find((link) => link.tabIndex === 0);

    activeLink?.focus();
  }

  private handleEvents() {
    this.addEventListener("focus", () => this.focusOnActiveLink());

    this.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.stopPropagation();
        event.preventDefault();

        const allLinks = [...this.querySelectorAll(`a[data-index]`)] as HTMLAnchorElement[];
        const activeIndex = allLinks.findIndex((link) => link.tabIndex === 0);

        if (activeIndex !== -1) {
          const nextIndex = (activeIndex + (event.key === "ArrowDown" ? 1 : allLinks.length - 1)) % allLinks.length;
          allLinks.forEach((link) => (link.tabIndex = -1));
          allLinks[nextIndex].tabIndex = 0;
          allLinks[nextIndex].focus();
        }
      }
    });
  }
}
