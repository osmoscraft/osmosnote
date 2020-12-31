import "./line-overlay.css";

export class LineOverlayComponent extends HTMLElement {
  readonly dataset!: {
    isHeading?: "true";
    isInvalid?: "true";
    isEmpty?: "true";
    raw: string;
    sectionLevel: string; // 0-6
    layoutPadding: string; // number of spaces
    innerText: string;
  };

  connectedCallback() {
    const isEmpty = this.dataset.isEmpty === "true";

    // when invalid, display raw
    if (this.dataset.isInvalid === "true") {
      this.innerHTML = isEmpty ? `<span class="lnovly-empty-placeholder">↵</span>` : this.dataset.raw;
      return;
    }

    const layoutPadding = parseInt(this.dataset.layoutPadding) ?? 0;

    const layoutPaddingHtml = /*html*/ `<span class="lnovly-layout-padding">${"_".repeat(layoutPadding)}</span>`;
    const sectionLevel = parseInt(this.dataset.sectionLevel) ?? 0;

    const isHeading = this.dataset.isHeading === "true";

    const headingPrefixHtml = isHeading
      ? /*html*/ `<span class="lnovly-hidden-hash">${"#".repeat(sectionLevel - 1)}</span><span>#</span> `
      : "";

    this.innerHTML = /*html*/ `${layoutPaddingHtml}${headingPrefixHtml}${
      isEmpty ? `<span class="lnovly-empty-placeholder">↵</span>` : this.highlightLine(this.dataset.innerText)
    }`;
  }

  private highlightLine(input: string): string {
    return input.replace(LINK_PATTERN, LINK_REPLACER);
  }
}

export const LINK_PATTERN = /\[([^\(]+)\]\(([^\[]\d+)\)/g; // e.g. [Some title](200012300630)
const LINK_REPLACER = (_match: string, title: string, id: string) =>
  /*html*/ `<s2-link-overlay data-id="${id}" data-title="${title}"></s2-link-overlay>`;