export interface TemplateInput {
  title?: string;
  url?: string;
  content?: string;
}

export function getNoteFromTemplate(input: TemplateInput) {
  const lines = [
    `#+title: ${input.title ?? "New note"}\n`,
    `#+created: ${new Date().toISOString()}\n`,
    ...(input.url ? [`#+url: ${input.url}\n`] : []),
    `#+tags: \n`,
    `\n`,
    ...(input.content ? [input.content] : ["\n"]),
  ];

  return lines.join("");
}
