export function markdownToHtml(markdown: string): string {
  const html = markdown
    .split("\n")
    .map((line, i) => `<pre data-line="${i}">${markdownLineToHtmlLine(line)}</pre>`)
    .join("");

  return html;
}

export function domToMarkdown(dom: HTMLElement): string {
  const domCloned = dom.cloneNode(true) as HTMLElement;

  const markdown = [...domCloned.querySelectorAll(`pre[data-line]`)]
    .map((domLine) => DomLineToMarkdownLine(domLine as HTMLElement))
    .join("\n");

  return markdown;
}

function markdownLineToHtmlLine(markdown: string): string {
  const INTERNAL_LINK_REGEX = /\[([^\(]+)\]\(([^\[]\d+)\)/g; // e.g. [Some title](200012300630)

  function replacer(_match: string, title: string, id: string) {
    return `<a data-id="${id}" href="/editor.html?filename=${encodeURIComponent(
      `${id}.md`
    )}" contenteditable="false">${title}</a>`;
  }

  return markdown.replace(INTERNAL_LINK_REGEX, replacer);
}

function DomLineToMarkdownLine(dom: HTMLElement): string {
  dom.querySelectorAll(`a`).forEach((anchor) => (anchor.outerHTML = `[${anchor.innerText}](${anchor.dataset.id})`));

  return dom.innerText;
}
