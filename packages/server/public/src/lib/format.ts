import type { LineElement } from "./source-to-lines";

interface FormatContext {
  level: number;
}

export interface FormattedLineElement extends LineElement {
  dataset: {
    line: LineElement["dataset"]["line"];
    level: number;
  };
}

export function formatAll(root: HTMLElement) {
  const lines = [...root.querySelectorAll("[data-line]")] as FormattedLineElement[];
  const context: FormatContext = {
    level: 0,
  };

  lines.forEach((line) => formatLine(line, context));
}

export function formatLine(line: FormattedLineElement, context: FormatContext) {
  const rawText = line.innerText;

  // heading
  let match = rawText.match(/^(\s*)(#+) (.*)\n?/);
  if (match) {
    const [raw, spaces, hashes, text] = match;

    context.level = hashes.length;
    line.dataset.level = hashes.length;
    line.dataset.line = "heading";

    const indent = ` `.repeat(hashes.length - 1);
    const hiddenHashes = `#`.repeat(hashes.length - 1);

    line.innerHTML = `<span data-indent>${indent}</span><span data-wrap><span class="t--ghost">${hiddenHashes}</span><span class="t--bold"># ${text}</span>\n</span>`;

    return;
  }

  // meta
  match = rawText.match(/^#\+(.+?): (.*)\n?/);
  if (match) {
    const [raw, metaKey, metaValue] = match;

    line.dataset.line = "meta";

    switch (metaKey) {
      case "url":
        line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-url>${metaValue}</span>\n</span>`;
        break;
      case "title":
        line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value="title">${metaValue}</span>\n</span>`;
        break;
      case "tags":
        line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value="tags">${metaValue}</span>\n</span>`;
        break;
      default:
        throw new Error(`Unsupported meta key ${metaKey}`);
    }

    return;
  }

  // blank line
  // TBD

  // paragraph
  const indent = ` `.repeat(context.level * 2);

  let paragraphHtml = "";
  let remainingText = rawText.trim();
  while (remainingText) {
    let match = remainingText.match(/^(.*?)\[(.+?)\]\((.+?)\)/); // links
    if (match) {
      const [raw, plainText, linkTitle, linkTarget] = match;
      paragraphHtml += plainText;
      paragraphHtml += `<span data-link class="t--ghost">[<span class="link__title">${linkTitle}</span>](<span data-href="${linkTarget}" class="link__target">${linkTarget}</span>)</span>`;

      remainingText = remainingText.slice(raw.length);
      continue;
    }

    match = remainingText.match(/^(.*?)(https?:\/\/[^\s/$.?#].[^\s]*)/); // raw URL
    if (match) {
      const [raw, plainText, url] = match;
      paragraphHtml += plainText;
      paragraphHtml += `<span data-url>${url}</span>`;

      remainingText = remainingText.slice(raw.length);
      continue;
    }

    paragraphHtml += remainingText;
    remainingText = "";
  }

  line.innerHTML = `<span data-indent>${indent}</span><span data-wrap>${paragraphHtml}\n</span>`;
}

export function formatLineIncremental() {
  // TBD
  // format only if marked as dirty OR context has changed
}
