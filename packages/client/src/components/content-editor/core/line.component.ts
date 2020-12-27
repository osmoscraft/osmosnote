import "./line.css";

export class LineComponent extends HTMLPreElement {
  private handleMutation!: MutationCallback;

  readonly dataset!: {
    headingLevel: string;
    indentLevel: string;

    isEmpty: string;
  };

  connectedCallback() {
    this.processWhitespace();
    this.processHeading();
    this.processIndent();

    this.handleMutation = (mutationsList, observer) => {
      const characterChange = mutationsList.find((mutation) => mutation.type === "characterData");
      if (characterChange) {
        this.processWhitespace();
        this.processHeading();
        this.processIndent({ propagate: true });
      }
    };

    const observer = new MutationObserver(this.handleMutation);

    observer.observe(this, { subtree: true, characterData: true });
  }

  private processWhitespace() {
    if (!this.innerText.length) {
      // without a tangible <br> element, this line cannot be copied
      this.innerHTML = `<br>`;
    } else if (
      // convert different line ending conventions to html
      this.innerText === "\r\n" ||
      this.innerText === "\n" ||
      this.innerText === "\r" ||
      this.innerText === "\n\r"
    ) {
      this.innerHTML = `<br>`;
    } else if (this.innerText.includes("\n") || this.innerText.includes("\r")) {
      // strip any additional new lines
      this.innerText = this.innerText.replaceAll("\n", "").replaceAll("\r", "");
    }
  }

  private processHeading() {
    const headingResult = this.scanHeading(this.innerText);
    if (headingResult) {
      this.dataset.headingLevel = headingResult.level.toString();
    } else {
      this.removeAttribute("data-heading-level");
    }
  }

  private processIndent(props?: { propagate?: boolean }) {
    const previousIndentLevel = this.dataset.indentLevel;

    if (this.dataset.headingLevel) {
      this.dataset.indentLevel = this.dataset.headingLevel;
    } else if ((this.previousSibling as LineComponent)?.dataset?.indentLevel) {
      this.dataset.indentLevel = (this.previousSibling as LineComponent).dataset.indentLevel;
    } else {
      this.dataset.indentLevel = "0";
    }

    const isLevelChanged = previousIndentLevel !== this.dataset.indentLevel;

    if (props?.propagate && isLevelChanged) {
      if ((this.nextSibling as any)?.processIndent) {
        (this.nextSibling as LineComponent).processIndent({ propagate: true });
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
}
