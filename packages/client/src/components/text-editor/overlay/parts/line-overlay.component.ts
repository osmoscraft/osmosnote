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
    // TODO, use AST instead of manually regex.
    // TODO, prevent link inside tag, as it's not searchable
    // TODO, prevent tag inside link, as it breaks atomic interaction on link
    return input.replace(LINK_PATTERN, LINK_REPLACER).replace(TAG_PATTERN, TAG_REPLACER);
  }
}

export const LINK_PATTERN = /\[([^\(]+)\]\(([^\[]\d+)\)/g; // e.g. [Some title](200012300630)
const LINK_REPLACER = (_match: string, title: string, id: string) =>
  /*html*/ `<s2-link-overlay data-id="${id}" data-title="${title}"></s2-link-overlay>`;

export const TAG_PATTERN = /:.+:/g; // e.g. :some:key word:like this:
const TAG_REPLACER = (match: string) => /*html*/ `<s2-tag-overlay data-raw="${match}"></s2-tag-overlay>`;
