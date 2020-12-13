export function markdownToHtml(markdown: string): string {
  const html = markdown
    .split("\n")
    .map((line, i) => markdownLineToHtmlLine(line))
    .join("");

  return html;
}

export function domToMarkdown(dom: HTMLElement): string {
  const domCloned = dom.cloneNode(true) as HTMLElement;

  const markdown = [...domCloned.querySelectorAll(`pre[is="s2-line"]`)]
    .map((lineWrapperDom) => DomLineToMarkdownLine(lineWrapperDom as HTMLElement))
    .join("\n");

  return markdown;
}

function markdownLineToHtmlLine(markdown: string): string {
  return (
    markdown
      // .replace(S2Heading.MARKDOWN_REGEX, S2Heading.MARKDOWN_REPLACER)
      .replace(S2Link.MARKDOWN_REGEX, S2Link.MARKDOWN_REPLACER)
      .replace(S2Line.MARKDOWN_REGEX, S2Line.MARKDOWN_REPLACER)
  ); // Do the line wrapping last or it will interfere with heading detection
}

function DomLineToMarkdownLine(dom: HTMLElement): string {
  // must follow order: leaf -> root
  dom.querySelectorAll(S2Link.DOM_SELECTOR).forEach(S2Link.DOM_REPLACER);
  // dom.querySelectorAll(S2Heading.DOM_SELECTOR).forEach(S2Heading.DOM_REPLACER);
  dom.querySelectorAll(S2Line.DOM_SELECTOR).forEach(S2Line.DOM_REPLACER);

  return dom.innerText;
}

/**
 * TODO consider refactor this into a separate "formatter" module
 */
// export function updateIndentation(dom: HTMLElement) {
//   let currentIndent = 0;

//   dom.querySelectorAll("div[data-line]").forEach((lineWrapperDom) => {
//     // if line contains heading of level x, update current level to x
//     const headingDom = lineWrapperDom.querySelector(S2Heading.DOM_SELECTOR) as HTMLHeadingElement;
//     if (headingDom) {
//       currentIndent = parseInt(headingDom.dataset.level as string);
//       (lineWrapperDom as HTMLElement).dataset.hasHeading = "";
//     }

//     (lineWrapperDom as HTMLElement).dataset.indent = currentIndent.toString();
//   });
// }

// class S2Heading extends HTMLHeadingElement {
//   static DOM_SELECTOR = `h2[is="s2-heading"]`;
//   static DOM_REPLACER = (element: Element) => (element.outerHTML = (element as S2Heading).markdownText);

//   static MARKDOWN_REGEX = /^#{1,6} (.*)/gm; // e.g. # My title
//   static MARKDOWN_REPLACER = (_match: string, title: string) => {
//     const level = _match.split(" ")[0].length;
//     return `<h2 is="s2-heading" data-level="${level}"><code class="hidden-hash">${"#".repeat(
//       level - 1
//     )}</code><code># </code>${title}</h2}>`;
//   };

//   get markdownText() {
//     return this.innerText;
//   }
// }
// // TODO, use the correct semantic level. It requires defining a new class for each level.
// customElements.define("s2-heading", S2Heading, { extends: "h2" });

class S2Link extends HTMLAnchorElement {
  static DOM_SELECTOR = `a[is="s2-link"]`;
  static DOM_REPLACER = (element: Element) => (element.outerHTML = (element as S2Link).markdownText);

  static MARKDOWN_REGEX = /\[([^\(]+)\]\(([^\[]\d+)\)/g; // e.g. [Some title](200012300630)
  static MARKDOWN_REPLACER = (_match: string, title: string, id: string) =>
    `<a is="s2-link" data-id="${id}" href="/editor.html?filename=${encodeURIComponent(`${id}.md`)}">${title}</a>`;

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
customElements.define("s2-link", S2Link, { extends: "a" });

class S2Line extends HTMLPreElement {
  readonly dataset!: {
    headingLevel: string;
    indentLevel: string;
  };

  static DOM_SELECTOR = `pre[is="s2-line"]`;
  static DOM_REPLACER = (element: Element) => (element.outerHTML = (element as S2Link).markdownText);

  static MARKDOWN_REGEX = /^.*$/gm; // match whole lines
  static MARKDOWN_REPLACER = (match: string) => `<pre is="s2-line">${match}</pre>`;

  get markdownText() {
    return this.innerText;
  }

  connectedCallback() {
    this.processHeading();
    this.processIndent();

    // TODO save as instance property for GC
    const callback: MutationCallback = (mutationsList, observer) => {
      const characterChange = mutationsList.find((mutation) => mutation.type === "characterData");
      if (characterChange) {
        this.processHeading();
        this.processIndent({ propagate: true });
      }
    };

    const observer = new MutationObserver(callback);

    observer.observe(this, { subtree: true, characterData: true });
  }

  processHeading() {
    const headingResult = this.scanHeading(this.innerText);
    if (headingResult) {
      this.dataset.headingLevel = headingResult.level.toString();
    } else {
      this.removeAttribute("data-heading-level");
    }
  }

  processIndent(props?: { propagate?: boolean }) {
    const previousIndentLevel = this.dataset.indentLevel;

    if (this.dataset.headingLevel) {
      this.dataset.indentLevel = this.dataset.headingLevel;
    } else if ((this.previousSibling as S2Line)?.dataset?.indentLevel) {
      this.dataset.indentLevel = (this.previousSibling as S2Line).dataset.indentLevel;
    } else {
      this.dataset.indentLevel = "0";
    }

    const isLevelChanged = previousIndentLevel !== this.dataset.indentLevel;

    if (props?.propagate && isLevelChanged) {
      if ((this.nextSibling as any)?.processIndent) {
        (this.nextSibling as S2Line).processIndent({ propagate: true });
      }
    }
  }

  private scanHeading: (rawMarkdown: string) => null | { level: number; title: string } = (rawHTML) => {
    // TODO the html may have prefix elements already
    const MARKDOWN_REGEX = /^(#{1,6}) (.*)/; // e.g. # My title
    const [match, levelHash, title] = rawHTML.match(MARKDOWN_REGEX) ?? [];

    if (match) {
      return {
        level: levelHash.length,
        title: title,
      };
    } else {
      return null;
    }
  };

  // TODO this is used in overlay mode
  private renderHeading(props: { level: number; title: string }) {
    return `<code class="hidden-hash">${"#".repeat(props.level - 1)}</code><code># </code> ${props.title}`;
  }
}
customElements.define("s2-line", S2Line, { extends: "pre" });
