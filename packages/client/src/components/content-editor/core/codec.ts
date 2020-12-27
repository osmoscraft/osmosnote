import { S2_HEADING_REGEX, S2_HEADING_REPLACER } from "./heading";
import { LineComponent } from "./line.component";
import { S2_LINK_REGEX, S2_LINK_REPLACER, LinkComponent } from "./link.component";

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
  const markdown = [...dom.querySelectorAll(`[is="s2-line"]`)]
    .map((line) => (line as LineComponent).innerText.split("\n").join(""))
    .join("\n");

  return markdown;
}

function highlightLine(lineMarkdown: string): string {
  return lineMarkdown.replace(S2_HEADING_REGEX, S2_HEADING_REPLACER).replace(S2_LINK_REGEX, S2_LINK_REPLACER);
}

customElements.define("s2-link", LinkComponent);
customElements.define("s2-line", LineComponent, { extends: "pre" });
