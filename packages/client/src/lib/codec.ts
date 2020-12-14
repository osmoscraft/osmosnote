export function markdownToEditableHtml(markdown: string): string {
  const html = markdown
    .split("\n")
    .map((line, i) => `<pre is="s2-line">${line}</pre>`)
    .join("");

  return html;
}

export function markdownToOverlayHtml(markdown: string): string {
  const html = markdown
    .split("\n")
    .map((line, i) => `<pre is="s2-line">${highlightLine(line)}</pre>`)
    .join("");

  return html;
}

export function editableNoteToMarkdown(dom: HTMLElement): string {
  const markdown = [...dom.querySelectorAll(`pre[is="s2-line"]`)].map((line) => (line as S2Line).innerText).join("\n");

  return markdown;
}

function highlightLine(lineMarkdown: string): string {
  return lineMarkdown.replace(S2Link.MARKDOWN_REGEX, S2Link.MARKDOWN_REPLACER);
}

class S2Link extends HTMLAnchorElement {
  static MARKDOWN_REGEX = /\[([^\(]+)\]\(([^\[]\d+)\)/g; // e.g. [Some title](200012300630)
  static MARKDOWN_REPLACER = (_match: string, title: string, id: string) =>
    `[${title}](<a is="s2-link" data-id="${id}" href="/editor.html?filename=${encodeURIComponent(
      `${id}.md`
    )}">${id}</a>)`;

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

    const observer = new MutationObserver(this.handleMutation);

    observer.observe(this, { subtree: true, characterData: true });
  }

  handleMutation: MutationCallback = (mutationsList, observer) => {
    const characterChange = mutationsList.find((mutation) => mutation.type === "characterData");
    if (characterChange) {
      this.processHeading();
      this.processIndent({ propagate: true });
    }
  };

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
