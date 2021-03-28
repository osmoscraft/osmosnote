import type { FormatContext, LineCompiler } from "../format.service.js";
import type { LineElement } from "../helpers/source-to-lines.js";
import { removeLineEnding } from "../helpers/string.js";

export const BLANK_PATTERN = /^(\s+)$/;

function match(rawText: string) {
  return rawText.match(BLANK_PATTERN);
}

function parse(line: LineElement, match: RegExpMatchArray) {
  const [raw, spaces] = match;

  line.dataset.line = "blank";

  const inlineSpaces = removeLineEnding(spaces);

  line.innerHTML = `<span data-indent>${inlineSpaces}</span><span data-empty-content>\n</span>`;
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

function updateContext(_line: LineElement, context: FormatContext) {
  context.indentFromList = 0;
  context.listSelfIndentFromSetter = [0];
}

export const blank: LineCompiler = {
  match,
  parse,
  format,
  updateContext,
};
