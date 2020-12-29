import type { EditorModel } from "../editor-model";

export function modelToFileText(model: EditorModel): string {
  const text = model.lines
    .map((line, i) => {
      return line.fileRaw;
    })
    .join("\n");

  return text;
}
