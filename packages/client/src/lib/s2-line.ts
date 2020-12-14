export class S2Line extends HTMLPreElement {
  readonly dataset!: {
    headingLevel: string;
    indentLevel: string;
  };

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

  private scanHeading: (rawMarkdown: string) => null | { level: number; title: string } = (rawMarkdown) => {
    const normalizedMarkdown = rawMarkdown.split("\n").join(""); // DOM seems to automatically inject line breaks between elements

    // TODO the html may have prefix elements already
    const MARKDOWN_REGEX = /^(#{1,6}) (.*)/; // e.g. # My title
    const [match, levelHash, title] = normalizedMarkdown.match(MARKDOWN_REGEX) ?? [];

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
