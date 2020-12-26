import { S2_HEADING_REGEX, S2_HEADING_REPLACER } from "./s2-heading";
import { S2Line } from "./s2-line";
import { S2_LINK_REGEX, S2_LINK_REPLACER, S2Link } from "./s2-link";

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
  const markdown = [...dom.querySelectorAll(`pre[is="s2-line"]`)]
    .map((line) => (line as S2Line).innerText.split("\n").join(""))
    .join("\n");

  return markdown;
}

function highlightLine(lineMarkdown: string): string {
  return lineMarkdown.replace(S2_HEADING_REGEX, S2_HEADING_REPLACER).replace(S2_LINK_REGEX, S2_LINK_REPLACER);
}

customElements.define("s2-link", S2Link, { extends: "a" });
customElements.define("s2-line", S2Line, { extends: "pre" });
