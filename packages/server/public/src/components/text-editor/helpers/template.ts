import { ensureNoteTitle } from "../../../utils/ensure-note-title.js";
import { SRC_LINE_END } from "../../../utils/special-characters.js";
import { getLocalTimestamp } from "../../../utils/time.js";

export interface TemplateInput {
  title?: string;
  url?: string;
  content?: string;
}

export interface TemplateOutput {
  title: string;
  note: string;
}

export function getNoteFromTemplate(input: TemplateInput): TemplateOutput {
  const title = ensureNoteTitle(input.title);

  const lines = [
    `#+title: ${title}${SRC_LINE_END}`,
    `#+created: ${getLocalTimestamp(new Date())}${SRC_LINE_END}`,
    ...(input.url ? [`#+url: ${input.url}${SRC_LINE_END}`] : []),
    `${SRC_LINE_END}`,
    ...(input.content ? [input.content] : [SRC_LINE_END]),
  ];

  const note = lines.join("");

  return {
    title,
    note,
  };
}
