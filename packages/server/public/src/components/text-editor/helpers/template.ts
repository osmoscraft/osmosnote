import { ensureNoteTitle } from "../../../utils/ensure-note-title.js";
import { SRC_LINE_END } from "../../../utils/special-characters.js";
import { getLocalTimestamp } from "../../../utils/time.js";

export interface TemplateInput {
  title?: string;
  url?: string;
  content?: string;
}

export function getNoteFromTemplate(input: TemplateInput) {
  const lines = [
    `#+title: ${ensureNoteTitle(input.title)}${SRC_LINE_END}`,
    `#+created: ${getLocalTimestamp(new Date())}${SRC_LINE_END}`,
    ...(input.url ? [`#+url: ${input.url}${SRC_LINE_END}`] : []),
    `#+tags: ${SRC_LINE_END}`,
    `${SRC_LINE_END}`,
    ...(input.content ? [input.content] : [SRC_LINE_END]),
  ];

  return lines.join("");
}
