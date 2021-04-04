import { UI_LINE_END } from "../../../utils/special-characters.js";
import type { LineElement } from "../helpers/source-to-lines.js";
import { removeLineEnding } from "../helpers/string.js";
import type { FormatContext, LineCompiler } from "./compile.service.js";
import { parseInlineParagraph } from "./parse-inline-paragraph.js";

function match(rawText: string): RegExpMatchArray {
  return [rawText]; // similate a regexp match
}

function parse(line: LineElement, match: RegExpMatchArray) {
  let remainingText = removeLineEnding(match[0]);
  let indent = remainingText.match(/^(\s+)/)?.[0] ?? "";

  remainingText = remainingText.slice(indent.length);

  const paragraphHtml = parseInlineParagraph(remainingText);

  line.innerHTML = `<span data-indent>${indent}</span><span data-wrap>${paragraphHtml}${UI_LINE_END}</span>`;
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
