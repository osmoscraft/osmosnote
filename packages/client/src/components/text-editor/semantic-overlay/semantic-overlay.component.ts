import "./semantic-overlay.css";

export class SemanticOverlayComponent extends HTMLElement {
  updateContent(content: string) {
    this.innerHTML = this.markdownToOverlayHtml(content);
  }

  updateScroll(referenceDom: HTMLElement) {
    this.scrollTop = referenceDom.scrollTop;
    this.scrollLeft = referenceDom.scrollLeft;
  }

  private markdownToOverlayHtml(markdown: string): string {
    const html = markdown
      .split("\n")
      .map((line, i) => /*html*/ `<pre class="semovl-line">${line?.length ? line : "↵"}</pre>`)
      .join("");

    return html;
  }
}
