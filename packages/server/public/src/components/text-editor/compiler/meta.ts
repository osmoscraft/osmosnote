import type { LineCompiler } from "./compile.service";
import type { LineElement } from "../helpers/source-to-lines";

const META_PATTERN = /^#\+(.+?): (.*)\n?/; // `#+key: value`

function match(rawText: string) {
  return rawText.match(META_PATTERN);
}

function parse(line: LineElement, match: RegExpMatchArray) {
  const [raw, metaKey, metaValue] = match;

  line.dataset.line = "meta";

  switch (metaKey) {
    case "url":
      line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-url="${metaValue}">${metaValue}</span>\n</span>`;
      line.spellcheck = false;
      break;
    case "title":
      line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value="title">${metaValue}</span>\n</span>`;
      break;
    case "tags":
      line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value="tags">${metaValue}</span>\n</span>`;
      break;
    case "created":
      line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value="created">${metaValue}</span>\n</span>`;
      line.spellcheck = false;
      break;
    default:
      line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value>${metaValue}</span>\n</span>`;
      console.error(`Unsupported meta key ${metaKey}`);
  }
}

function format() {
  return {
    lengthChange: 0,
  };
}

export const meta: LineCompiler = {
  match,
  parse,
  format,
};
