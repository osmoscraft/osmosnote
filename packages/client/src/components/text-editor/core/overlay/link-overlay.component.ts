import {
  CursorSelectionService,
  CursorSelection,
} from "../../../../services/cursor-selection/cursor-selection.service";
import { di } from "../../../../utils/dependency-injector";
import "./link-overlay.css";

export class LinkOverlayComponent extends HTMLElement {
  private cursorSelectionService!: CursorSelectionService;
  private anchorDom!: HTMLAnchorElement;

  readonly dataset!: {
    title: string;
    id: string;
    cursorIn?: "on";
  };

  constructor() {
    super();

    // this.handleCursorSelectionEvent = this.handleCursorSelectionEvent.bind(this);
    // this.handleOpenLink = this.handleOpenLink.bind(this);
  }

  connectedCallback() {
    this.cursorSelectionService = di.getSingleton(CursorSelectionService);
    // this.cursorSelectionService.eventTarget.addEventListener(
    //   "cursor-selection:change",
    //   this.handleCursorSelectionEvent
    // );

    this.innerHTML = /*html*/ `<code class="s2-link-overlay__symbol">[</code><code class="s2-link-overlay__title">${
      this.dataset.title
    }</code><code class="s2-link-overlay__symbol">](</code><a tabindex="-1" class="s2-link-overlay__id" href="/?filename=${encodeURIComponent(
      `${this.dataset.id}.md`
    )}">${this.dataset.id}</a><code class="s2-link-overlay__symbol">)</code>`;

    this.anchorDom = this.querySelector("a")!;

    this.handleCursorSelection(this.cursorSelectionService.getCurrentSelection());
  }

  // disconnectedCallback() {
  //   this.cursorSelectionService.eventTarget.removeEventListener(
  //     "cursor-selection:change",
  //     this.handleCursorSelectionEvent
  //   );
  //   window.removeEventListener("keydown", this.handleOpenLink);
  // }

  // private handleCursorSelectionEvent(e: CustomEvent<CursorSelection>) {
  //   this.handleCursorSelection(e.detail);
  // }

  private handleCursorSelection(selection: CursorSelection) {
    if (!this.dataset.cursorIn && this.dataset.id === selection.linkId) {
      // off to on
      this.dataset.cursorIn = "on";
      // window.addEventListener("keydown", this.handleOpenLink);
    } else if (this.dataset.cursorIn === "on" && this.dataset.id !== selection.linkId) {
      // on to off
      delete this.dataset.cursorIn;
      // window.removeEventListener("keydown", this.handleOpenLink);
    }
  }

  // private handleOpenLink(event: KeyboardEvent) {
  //   if (event.key === "Enter") {
  //     if (this.dataset.cursorIn === "on") {
  //       event.preventDefault();
  //       event.stopPropagation();
  //       window.open(this.anchorDom.href, event.ctrlKey ? undefined : "_self");
  //     }
  //   }
  // }
}
