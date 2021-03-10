import type { IncomingLink } from "@system-two/server";
import { ApiService } from "../../services/api/api.service.js";
import { RouteService } from "../../services/route/route.service.js";
import { di } from "../../utils/dependency-injector.js";

export class ReferencePanelComponent extends HTMLElement {
  private listDom!: HTMLUListElement;
  private noteService!: ApiService;
  private routeService!: RouteService;

  connectedCallback() {
    this.innerHTML = /*html*/ `<ul id="refpnl-list" class="refpnl-list"></ul>`;

    this.listDom = this.querySelector("#refpnl-list") as HTMLUListElement;

    this.noteService = di.getSingleton(ApiService);
    this.routeService = di.getSingleton(RouteService);
    this.loadContent();

    this.handleEvents();
  }

  focusOnActiveLink() {
    const allLinks = [...this.querySelectorAll(`a[data-index]`)] as HTMLAnchorElement[];
    const activeLink = allLinks.find((link) => link.tabIndex === 0);

    activeLink?.focus();
  }

  private async loadContent() {
    const { id } = this.routeService.getNoteConfigFromUrl();
    if (id) {
      const data = await this.noteService.getIncomingLinks(id);
      this.setIncomingLinks(data.incomingLinks);
    }
  }

  private setIncomingLinks(links: IncomingLink[]) {
    this.listDom.innerHTML = links
      .map(
        (note, index) => /*html*/ `
    <li>
      <a class="refpnl-link" data-index="${index}" tabindex="${index === 0 ? 0 : -1}" href="/?id=${note.id}">${
          note.title
        }</a>
    </li>
    `
      )
      .join("");
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
