import type { FormatContext, LineCompiler } from "./compile.service.js";
import type { LineElement } from "../helpers/source-to-lines.js";
import { removeLineEnding } from "../helpers/string.js";
import { UI_LINE_END } from "../../../utils/special-characters.js";

const BLANK_PATTERN = /^(\s+)$/;

function match(rawText: string) {
  return rawText.match(BLANK_PATTERN);
}

function parse(line: LineElement, match: RegExpMatchArray) {
  const [raw, spaces] = match;

  line.dataset.line = "blank";

  const inlineSpaces = removeLineEnding(spaces);

  line.innerHTML = `<span data-indent>${inlineSpaces}</span><span data-empty-content>${UI_LINE_END}</span>`;
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
  context.listIndentFromSetter = [];
  context.listOrderFromSetter = [];
}

export const blank: LineCompiler = {
  match,
  parse,
  format,
  updateContext,
};
