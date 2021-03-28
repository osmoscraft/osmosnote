import type { FormatContext, LineCompiler } from "../compile.service";
import type { LineElement } from "../../helpers/source-to-lines";

const LIST_PATTERN = /^(\s*)(-*)(-|\d+\.) (.*)\n?/; // `-- Item`, or `--1. Item`

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

  const hiddenHyphens = `-`.repeat(levelSetters.length);

  line.innerHTML = `<span data-indent>${spaces}</span><span data-wrap><span class="t--ghost">${hiddenHyphens}</span><span class="list-marker">${listMarker}</span> ${text}\n</span>`;
}

function format(line: LineElement, context: FormatContext) {
  const levelSettersLength = parseInt(line.dataset.listLevel!) - 1;

  const listSelfIndent = context.listSelfIndentFromSetter[levelSettersLength] ?? 0;
  const indentSize = context.indentFromHeading + listSelfIndent;

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

  const currentIdentSize = context.listSelfIndentFromSetter[levelSettersLength] ?? 0;
  context.listSelfIndentFromSetter[levelSettersLength + 1] = currentIdentSize + listMarkerLength;
  context.indentFromList = currentIdentSize + levelSettersLength + listMarkerLength + 1;
}

export const list: LineCompiler = {
  match,
  parse,
  format,
  updateContext,
};
