export function markdownToHtml(markdown: string): string {
  const html = markdown
    .split("\n")
    .map((line, i) => `<div data-line="${i}">${markdownLineToHtmlLine(line)}</div>`)
    .join("");

  return html;
}

export function domToMarkdown(dom: HTMLElement): string {
  const domCloned = dom.cloneNode(true) as HTMLElement;

  const markdown = [...domCloned.querySelectorAll(`div[data-line]`)]
    .map((lineWrapperDom) => DomLineToMarkdownLine(lineWrapperDom as HTMLElement))
    .join("\n");

  return markdown;
}

function markdownLineToHtmlLine(markdown: string): string {
  return markdown
    .replace(S2Heading.MARKDOWN_REGEX, S2Heading.MARKDOWN_REPLACER)
    .replace(S2Link.MARKDOWN_REGEX, S2Link.MARKDOWN_REPLACER);
}

function DomLineToMarkdownLine(dom: HTMLElement): string {
  dom.querySelectorAll(S2Link.DOM_SELECTOR).forEach(S2Link.DOM_REPLACER);
  dom.querySelectorAll(S2Heading.DOM_SELECTOR).forEach(S2Heading.DOM_REPLACER);

  return dom.innerText;
}

/**
 * TODO consider refactor this into a separate "formatter" module
 */
export function updateIndentation(dom: HTMLElement) {
  let currentLevel = "1"; // notice we are working with string, not number;

  dom.querySelectorAll("div[data-line]").forEach((lineWrapperDom) => {
    // if line contains heading of level x, update current level to x
    const headingDom = lineWrapperDom.querySelector(S2Heading.DOM_SELECTOR) as HTMLHeadingElement;
    if (headingDom) {
      currentLevel = headingDom.dataset.level as string;
      (lineWrapperDom as HTMLElement).dataset.hasHeading = "";
    }

    (lineWrapperDom as HTMLElement).dataset.indent = currentLevel;
  });
}

class S2Heading extends HTMLHeadingElement {
  static DOM_SELECTOR = `h2[is="s2-heading"]`;
  static DOM_REPLACER = (element: Element) => (element.outerHTML = (element as S2Heading).markdownText);

  static MARKDOWN_REGEX = /^#{1,6} (.*)/gm; // e.g. # My title
  static MARKDOWN_REPLACER = (_match: string, title: string) => {
    const level = _match.split(" ")[0].length;
    return `<h2 is="s2-heading" data-level="${level}"><code class="hidden-hash">${"#".repeat(
      level - 1
    )}</code><code># </code>${title}</h2}>`;
  };

  get markdownText() {
    return this.innerText;
  }
}
// TODO, use the correct semantic level. It requires defining a new class for each level.
customElements.define("s2-heading", S2Heading, { extends: "h2" });

class S2Link extends HTMLAnchorElement {
  static DOM_SELECTOR = `a[is="s2-link"]`;
  static DOM_REPLACER = (element: Element) => (element.outerHTML = (element as S2Link).markdownText);

  static MARKDOWN_REGEX = /\[([^\(]+)\]\(([^\[]\d+)\)/g; // e.g. [Some title](200012300630)
  static MARKDOWN_REPLACER = (_match: string, title: string, id: string) =>
    `<a is="s2-link" data-id="${id}" href="/editor.html?filename=${encodeURIComponent(`${id}.md`)}">${title}</a>`;

  get markdownText() {
    return `[${this.innerText}](${this.dataset.id ?? this.getAttribute("href")})`;
  }
}
customElements.define("s2-link", S2Link, { extends: "a" });
