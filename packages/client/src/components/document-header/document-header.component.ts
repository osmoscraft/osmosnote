import "./document-header.css";

export class DocumentHeaderComponent extends HTMLElement {
  headingDom!: HTMLHeadingElement;
  detailsDom!: HTMLDetailsElement;
  summaryDom!: HTMLElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <details id="document-metadata" class="dchdr-metadata">
      <summary class="dchdr-metadata__summary">Metadata</summary>
      <div class="dchdr-fields">
        <label for="meta-id" class="dchdr-field__label">ID</label>
        <input class="dchdr-field__input" id="meta-id" readonly value="202012120000">
        <label for="meta-url" class="dchdr-field__label">External URL</label>
        <input class="dchdr-field__input" id="meta-url" type="url" value="https://www.example.com">
      </div>
    </details>
    <h1 id="document-heading" class="dchdr-heading" contenteditable="true"></h1>
    `;

    this.headingDom = this.querySelector("#document-heading") as HTMLHeadingElement;
    this.detailsDom = this.querySelector("details")!;
    this.summaryDom = this.querySelector("summary")!;
    this.updateSummaryText();

    this.handleEvents();
  }

  getTitle(): string {
    return this.headingDom.innerText;
  }

  setTitle(title: string) {
    this.headingDom.innerText = title;
  }

  private handleEvents() {
    this.detailsDom.addEventListener("toggle", () => {
      this.updateSummaryText();
    });
  }

  private updateSummaryText() {
    if (this.detailsDom.open) {
      this.summaryDom.innerText = "Metadata";
    } else {
      this.summaryDom.innerText = this.getCompactSummary();
    }
  }

  private getCompactSummary(): string {
    const fields = this.querySelectorAll("input");
    const displayString = [...fields].map((field) => field.value).join(" · ");
    return displayString;
  }
}
