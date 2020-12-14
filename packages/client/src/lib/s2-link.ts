export const S2_LINK_REGEX = /\[([^\(]+)\]\(([^\[]\d+)\)/g; // e.g. [Some title](200012300630)
export const S2_LINK_REPLACER = (_match: string, title: string, id: string) =>
  `[${title}](<a is="s2-link" data-id="${id}" href="/editor.html?filename=${encodeURIComponent(
    `${id}.md`
  )}">${id}</a>)`;

export class S2Link extends HTMLAnchorElement {
  connectedCallback() {
    // allow opening link in contenteditable mode
    this.addEventListener("click", (e) => {
      if (e.ctrlKey) {
        window.open(this.href);
      } else {
        window.open(this.href, "_self");
      }
    });
  }

  get markdownText() {
    return `[${this.innerText}](${this.dataset.id ?? this.getAttribute("href")})`;
  }
}
