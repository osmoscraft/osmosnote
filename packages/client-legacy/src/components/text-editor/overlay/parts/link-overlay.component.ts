import {
  CursorSelectionService,
  CursorSelection,
} from "../../../../services/cursor-selection/cursor-selection.service";
import { di } from "../../../../utils/dependency-injector";
import "./link-overlay.css";

export class LinkOverlayComponent extends HTMLElement {
  private cursorSelectionService!: CursorSelectionService;

  readonly dataset!: {
    title: string;
    id: string;
    cursorIn?: "on";
  };

  connectedCallback() {
    this.cursorSelectionService = di.getSingleton(CursorSelectionService);

    this.innerHTML = /*html*/ `<code class="s2-link-overlay__symbol">[</code><code class="s2-link-overlay__title">${
      this.dataset.title
    }</code><code class="s2-link-overlay__symbol">](</code><a tabindex="-1" class="s2-link-overlay__id" href="/?filename=${encodeURIComponent(
      `${this.dataset.id}.md`
    )}">${this.dataset.id}</a><code class="s2-link-overlay__symbol">)</code>`;

    this.handleCursorSelection(this.cursorSelectionService.getCurrentSelection());
  }

  private handleCursorSelection(selection: CursorSelection) {
    if (!this.dataset.cursorIn && this.dataset.id === selection.linkId) {
      // off to on
      this.dataset.cursorIn = "on";
    } else if (this.dataset.cursorIn === "on" && this.dataset.id !== selection.linkId) {
      // on to off
      delete this.dataset.cursorIn;
    }
  }
}
