import type { FormatContext, LineCompiler } from "./compile.service";
import type { LineElement } from "../helpers/source-to-lines";
import { UI_LINE_END } from "../../../utils/special-characters.js";

const HEADING_PATTERN = /^(\s*)(#+) (.*)/; // `### Heading`

function match(rawText: string) {
  return rawText.match(HEADING_PATTERN);
}

function parse(line: LineElement, match: RegExpMatchArray) {
  const [raw, spaces, hashes, text] = match;

  line.dataset.headingLevel = hashes.length.toString();
  line.dataset.line = "heading";

  const hiddenHashes = `#`.repeat(hashes.length - 1);

  line.innerHTML = `<span data-indent>${spaces}</span><span data-wrap><span class="t--ghost">${hiddenHashes}</span><span class="t--bold"># ${text}</span>${UI_LINE_END}</span>`;
}

function format(line: LineElement) {
  const indentSize = parseInt(line.dataset.headingLevel!) - 1;
  const indent = line.querySelector(`[data-indent]`)!;
  const lengthChange = indentSize - indent.textContent!.length;
  if (lengthChange !== 0) {
    indent.textContent = ` `.repeat(indentSize);
  }

  return {
    lengthChange,
  };
}

function updateContext(line: LineElement, context: FormatContext) {
  const headingLevel = parseInt(line.dataset.headingLevel!);
  context.indentFromHeading = headingLevel * 2;
  context.indentFromList = 0; // heading resets list indent
  context.listIndentFromSetter = [];
  context.listOrderFromSetter = [];
}

export const heading: LineCompiler = {
  match,
  parse,
  format,
  updateContext,
};
