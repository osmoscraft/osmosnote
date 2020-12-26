import { CursorSelection, CursorSelectionService } from "../../../services/cursor-selection/cursor-selection.service";
import { di } from "../../../utils/dependency-injector";

export const S2_LINK_REGEX = /\[([^\(]+)\]\(([^\[]\d+)\)/g; // e.g. [Some title](200012300630)
export const S2_LINK_REPLACER = (_match: string, title: string, id: string) =>
  /*html*/ `<code class="s2-link__symbol">[</code><code class="s2-link__title">${title}</code><code class="s2-link__symbol">](</code><a is="s2-link" class="s2-link__id" data-id="${id}" href="/?filename=${encodeURIComponent(
    `${id}.md`
  )}">${id}</a><code class="s2-link__symbol">)</code>`;

export class S2Link extends HTMLAnchorElement {
  private cursorSelectionService!: CursorSelectionService;

  constructor() {
    super();

    this.handleCursorSelection = this.handleCursorSelection.bind(this);
  }

  connectedCallback() {
    // allow opening link in contenteditable mode
    this.addEventListener("click", (e) => {
      if (e.ctrlKey) {
        window.open(this.href);
      } else {
        window.open(this.href, "_self");
      }
    });

    this.cursorSelectionService = di.getSingleton(CursorSelectionService);
    this.cursorSelectionService.eventTarget.addEventListener("cursor-selection:change", this.handleCursorSelection);
  }

  disconnectedCallback() {
    this.cursorSelectionService.eventTarget.removeEventListener("cursor-selection:change", this.handleCursorSelection);
  }

  private handleCursorSelection(e: CustomEvent<CursorSelection>) {
    if (!this.dataset.cursorIn && this.dataset.id === e.detail.linkId) {
      // off to on
      this.dataset.cursorIn = "on";
    } else if (this.dataset.cursorIn === "on" && this.dataset.id !== e.detail.linkId) {
      // on to off
      delete this.dataset.cursorIn;
    }
  }

  get markdownText() {
    return `[${this.innerText}](${this.dataset.id ?? this.getAttribute("href")})`;
  }
}
