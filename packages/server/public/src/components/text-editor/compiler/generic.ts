import { URL_PATTERN_WITH_PREFIX } from "../../../utils/url.js";
import type { FormatContext, LineCompiler } from "../format.service.js";
import type { LineElement } from "../helpers/source-to-lines.js";
import { removeLineEnding } from "../helpers/string.js";

const TITLED_LINK_PATTERN = /^(.*?)\[([^\[\]]+?)\]\((.+?)\)/; // `[title](target)`

function match(rawText: string): RegExpMatchArray {
  return [rawText]; // similate a regexp match
}

function parse(line: LineElement, match: RegExpMatchArray) {
  let paragraphHtml = "";
  let remainingText = removeLineEnding(match[0]);
  let indent = remainingText.match(/^(\s+)/)?.[0] ?? "";
  let paragraphLength = 0;

  remainingText = remainingText.slice(indent.length);

  paragraphLength = remainingText.length;

  while (remainingText) {
    let match = remainingText.match(TITLED_LINK_PATTERN); // [title](target)
    if (match) {
      const [raw, plainText, linkTitle, linkTarget] = match;
      paragraphHtml += plainText;
      paragraphHtml += `<span data-link class="t--ghost"><span class="link__title">[${linkTitle}]</span>(<span data-title-target="${linkTarget}" class="link__target">${linkTarget}</span>)</span>`;

      remainingText = remainingText.slice(raw.length);
      continue;
    }

    match = remainingText.match(URL_PATTERN_WITH_PREFIX); // raw URL
    if (match) {
      const [raw, plainText, url] = match;
      paragraphHtml += plainText;
      paragraphHtml += `<span data-url="${url}">${url}</span>`;

      remainingText = remainingText.slice(raw.length);
      continue;
    }

    paragraphHtml += remainingText;
    remainingText = "";
  }

  line.innerHTML = `<span data-indent>${indent}</span><span data-wrap>${paragraphHtml}\n</span>`;
}

function format(line: LineElement, context: FormatContext) {
  const indentSize = context.indentFromHeading + context.indentFromList;

  const indent = line.querySelector(`[data-indent]`)!;

  const lengthChange = indentSize - indent.textContent!.length;
  if (lengthChange !== 0) {
    indent.textContent = ` `.repeat(indentSize);
  }

  return {
    lengthChange,
  };
}

export const generic: LineCompiler = {
  match,
  parse,
  format,
};
