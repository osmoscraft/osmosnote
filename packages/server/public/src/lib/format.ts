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

    line.innerHTML = `<span>${indent}</span><span class="t--ghost">${hiddenHashes}</span><span class="t--bold"># ${text}</span>\n`;

    return;
  }

  // meta
  match = rawText.match(/^#\+(.+?): (.*)\n?/);
  if (match) {
    const [raw, metaKey, metaValue] = match;

    line.dataset.line = "meta";

    line.innerHTML = `<span class="t--secondary">#+${metaKey}: </span><span data-meta-value="${metaKey}">${metaValue}</span>\n`;
    return;
  }

  // blank line
  // TBD

  // paragraph
  const indent = ` `.repeat(context.level * 2);

  let paragraphHtml = `<span>${indent}</span>`;
  let remainingText = rawText.trim();
  while (remainingText) {
    const match = remainingText.match(/^(.*?)\[(.+?)\]\((.+?)\)/); // links
    if (match) {
      const [raw, plainText, linkTitle, linkTarget] = match;
      paragraphHtml += plainText;
      paragraphHtml += `<a data-link href="/?id=${linkTarget}">[<span class="t--bold">${linkTitle}</span>]<span class="link--target">(${linkTarget})</span></a>`;

      remainingText = remainingText.slice(raw.length);
      continue;
    }

    paragraphHtml += remainingText;
    remainingText = "";
  }

  line.innerHTML = `${paragraphHtml}\n`;
}

export function formatLineIncremental() {
  // TBD
  // format only if marked as dirty OR context has changed
}

function isValidMetaKey(key?: string): key is LineElement["dataset"]["meta"] {
  if (!key) return false;

  return ["title", "tags"].includes(key);
}
