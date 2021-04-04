import { URL_PATTERN_WITH_PREFIX } from "../../../utils/url.js";

const TITLED_LINK_PATTERN = /^(.*?)\[([^\[\]]+?)\]\((.+?)\)/; // `[title](target)`

/**
 * Assumption: inlineText already has line ending character removed.
 */
export function parseInlineParagraph(inlineText: string) {
  let paragraphHtml = "";
  let remainingText = inlineText;

  while (remainingText) {
    let match = remainingText.match(TITLED_LINK_PATTERN); // [title](target)
    if (match) {
      const [raw, plainText, linkTitle, linkTarget] = match;
      paragraphHtml += plainText;
      paragraphHtml += `<span data-link class="t--ghost"><span class="link__title">[${linkTitle}]</span>(<span data-title-target="${linkTarget}" class="link__target" spellcheck="false">${linkTarget}</span>)</span>`;

      remainingText = remainingText.slice(raw.length);
      continue;
    }

    match = remainingText.match(URL_PATTERN_WITH_PREFIX); // raw URL
    if (match) {
      const [raw, plainText, url] = match;
      paragraphHtml += plainText;
      paragraphHtml += `<span spellcheck="false" data-url="${url}">${url}</span>`;

      remainingText = remainingText.slice(raw.length);
      continue;
    }

    paragraphHtml += remainingText;
    remainingText = "";
  }

  return paragraphHtml;
}
