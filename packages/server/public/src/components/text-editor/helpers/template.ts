import { ensureNoteTitle } from "../../../utils/ensure-note-title.js";
import { getLocalTimestamp } from "../../../utils/time.js";

export interface TemplateInput {
  title?: string;
  url?: string;
  content?: string;
}

export function getNoteFromTemplate(input: TemplateInput) {
  const lines = [
    `#+title: ${ensureNoteTitle(input.title)}\n`,
    `#+created: ${getLocalTimestamp(new Date())}\n`,
    ...(input.url ? [`#+url: ${input.url}\n`] : []),
    `#+tags: \n`,
    `\n`,
    ...(input.content ? [input.content] : ["\n"]),
  ];

  return lines.join("");
}
