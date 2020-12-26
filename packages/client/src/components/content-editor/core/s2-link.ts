import { CursorSelection, CursorSelectionService } from "../../../services/cursor-selection/cursor-selection.service";
import { di } from "../../../utils/dependency-injector";
import "./s2-link.css";

export const S2_LINK_REGEX = /\[([^\(]+)\]\(([^\[]\d+)\)/g; // e.g. [Some title](200012300630)
export const S2_LINK_REPLACER = (_match: string, title: string, id: string) =>
  /*html*/ `<s2-link data-id="${id}"><code class="s2-link__symbol">[</code><code class="s2-link__title">${title}</code><code class="s2-link__symbol">](</code><a tabindex="-1" class="s2-link__id" href="/?filename=${encodeURIComponent(
    `${id}.md`
  )}">${id}</a><code class="s2-link__symbol">)</code></s2-link>`;

export class S2Link extends HTMLElement {
  private cursorSelectionService!: CursorSelectionService;
  private anchorDom!: HTMLAnchorElement;

  constructor() {
    super();

    this.handleCursorSelection = this.handleCursorSelection.bind(this);
    this.handleOpenLink = this.handleOpenLink.bind(this);
  }

  connectedCallback() {
    this.cursorSelectionService = di.getSingleton(CursorSelectionService);
    this.cursorSelectionService.eventTarget.addEventListener("cursor-selection:change", this.handleCursorSelection);

    this.anchorDom = this.querySelector("a")!;
  }

  disconnectedCallback() {
    this.cursorSelectionService.eventTarget.removeEventListener("cursor-selection:change", this.handleCursorSelection);
    window.removeEventListener("keydown", this.handleOpenLink);
  }

  private handleCursorSelection(e: CustomEvent<CursorSelection>) {
    if (!this.dataset.cursorIn && this.dataset.id === e.detail.linkId) {
      // off to on
      this.dataset.cursorIn = "on";
      window.addEventListener("keydown", this.handleOpenLink);
    } else if (this.dataset.cursorIn === "on" && this.dataset.id !== e.detail.linkId) {
      // on to off
      delete this.dataset.cursorIn;
      window.removeEventListener("keydown", this.handleOpenLink);
    }
  }

  private handleOpenLink(event: KeyboardEvent) {
    if (event.key === "Enter") {
      if (this.dataset.cursorIn === "on") {
        event.preventDefault();
        event.stopPropagation();
        window.open(this.anchorDom.href, event.ctrlKey ? undefined : "_self");
      }
    }
  }
}
