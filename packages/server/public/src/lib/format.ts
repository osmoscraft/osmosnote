import { elem, frag } from "./hyper.js";
import type { LineElement } from "./source-to-dom";

interface FormatContext {
  level: number;
}

export interface FormattedLineElement extends LineElement {
  dataset: {
    line: "";
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

    const indent = ` `.repeat(hashes.length - 1);
    const hiddenHashes = `#`.repeat(hashes.length - 1);

    line.innerHTML = `<span>${indent}</span><span class="text--ghost">${hiddenHashes}</span><span class="text--bold"># ${text}</span>\n`;

    return;
  }

  // meta
  match = rawText.match(/^#\+(.+?): (.*)\n?/);
  if (match) {
    const [raw, metaKey, metaValue] = match;
    line.textContent = `#+${metaKey}: ${metaValue}\n`;
    return;
  }

  // paragraph
  const indent = ` `.repeat(context.level * 2);
  line.textContent = `${indent}${rawText ?? ""}`;
}

export function formatLineIncremental() {
  // TBD
  // format only if marked as dirty OR context has changed
}
