import type { SearchResult } from "@system-two/server/src/routes/search";
import { emit } from "../../lib/events";
import { filenameToId } from "../../lib/id";

declare global {
  interface GlobalEventHandlersEventMap {
    "search-box:did-cancel": CustomEvent<never>;
    "search-box:did-select-link": CustomEvent<{ selectedLinkMarkdown: string }>;
  }
}

export class SearchBoxComponent extends HTMLElement {
  searchBoxDom!: HTMLInputElement;
  searchResultsDom!: HTMLElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `
      <input id="search-box" type="search" />
      <pre><output id="search-results"></output></pre>`;

    this.searchBoxDom = document.getElementById("search-box") as HTMLInputElement;
    this.searchResultsDom = document.getElementById("search-results") as HTMLElement;

    this.handleEvents();
  }

  public startSearch() {
    this.searchBoxDom.focus();
  }

  private handleEvents() {
    this.searchBoxDom.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();

        emit(this, "search-box:did-cancel");
      }
    });

    this.searchBoxDom.addEventListener("input", async (e) => {
      if (this.searchBoxDom.value.length) {
        const params = new URLSearchParams({
          phrase: this.searchBoxDom.value,
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        const result: SearchResult = await response.json();

        this.searchResultsDom.innerHTML = result.items
          .map((item) => `<button data-link="[${item.title}](${filenameToId(item.filename)})">${item.title}</button>`)
          .join("");
      } else {
        this.searchResultsDom.innerHTML = "";
      }
    });

    this.searchResultsDom.addEventListener("click", (e) => {
      const linkMarkdown = (e.target as HTMLButtonElement)?.dataset?.link;
      if (linkMarkdown) {
        this.searchBoxDom.value = "";
        this.searchResultsDom.innerHTML = "";

        emit(this, "search-box:did-select-link", { detail: { selectedLinkMarkdown: linkMarkdown } });
      }
    });
  }
}

customElements.define("s2-search-box", SearchBoxComponent);
