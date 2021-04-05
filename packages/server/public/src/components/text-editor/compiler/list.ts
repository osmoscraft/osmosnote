import type { FormatContext, LineCompiler } from "./compile.service.js";
import type { LineElement } from "../helpers/source-to-lines.js";
import { parseInlineParagraph } from "./parse-inline-paragraph.js";
import { UI_LINE_END } from "../../../utils/special-characters.js";

const LIST_PATTERN = /^(\s*)(-*)(-|\d+\.) (.*)/; // `-- Item`, or `--1. Item`
export const LIST_CONTROL_CHAR = "-";

function match(rawText: string) {
  return rawText.match(LIST_PATTERN);
}

function parse(line: LineElement, match: RegExpMatchArray) {
  const [raw, spaces, levelSetters, listMarker, text] = match;

  const listLevel = levelSetters.length + 1;

  line.dataset.line = "list";
  line.dataset.listLevel = listLevel.toString();
  line.dataset.list = listMarker === "-" ? "unordered" : "ordered";
  line.dataset.listMarker = listMarker;
  if (!text.length) line.dataset.listEmpty = "";

  const hiddenHyphens = LIST_CONTROL_CHAR.repeat(levelSetters.length);

  const paragraphHtml = parseInlineParagraph(text);

  line.innerHTML = `<span data-indent>${spaces}</span><span data-wrap><span class="t--ghost">${hiddenHyphens}</span><span data-list-marker>${listMarker}</span> ${paragraphHtml}${UI_LINE_END}</span>`;
}

function format(line: LineElement, context: FormatContext) {
  const levelSettersLength = parseInt(line.dataset.listLevel!) - 1;

  const listSelfIndent = context.listIndentFromSetter[levelSettersLength] ?? 0;
  const indentSize = context.indentFromHeading + listSelfIndent;

  // Format ordering
  const previousOrder = context.listOrderFromSetter[levelSettersLength] ?? 0;
  if (line.dataset.list === "ordered") {
    line.querySelector(`[data-list-marker]`)!.textContent = `${previousOrder + 1}.`;
    line.dataset.listMarker = `${previousOrder + 1}.`;
  }

  // Format indent
  const indent = line.querySelector(`[data-indent]`)!;
  const lengthChange = indentSize - indent.textContent!.length;

  if (lengthChange !== 0) {
    indent.textContent = ` `.repeat(indentSize);
  }

  return { lengthChange };
}

function updateContext(line: LineElement, context: FormatContext) {
  const levelSettersLength = parseInt(line.dataset.listLevel!) - 1;
  const listMarkerLength = line.dataset.listMarker!.length;

  // Update context for ordering
  context.listOrderFromSetter = context.listOrderFromSetter.slice(0, levelSettersLength + 1); // clear any deeper items
  const previousOrder = context.listOrderFromSetter[levelSettersLength] ?? 0;
  context.listOrderFromSetter[levelSettersLength] = previousOrder + 1;

  // Update context for indentation
  const currentIdentSize = context.listIndentFromSetter[levelSettersLength] ?? 0;
  context.listIndentFromSetter[levelSettersLength + 1] = currentIdentSize + listMarkerLength;
  context.indentFromList = currentIdentSize + levelSettersLength + listMarkerLength + 1;
}

export const list: LineCompiler = {
  match,
  parse,
  format,
  updateContext,
};
