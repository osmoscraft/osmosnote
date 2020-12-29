import type { EditorModel } from "../editor-model";

export function modelToDraftText(model: EditorModel): string {
  const text = model.lines
    .map((line, i) => {
      if (line.isFormatNeeded) return line.fileRaw;

      const layoutPadding = " ".repeat(line.indentation);
      const headingPrefix = line.isHeading ? `${"#".repeat(line.sectionLevel)} ` : "";

      return `${layoutPadding}${headingPrefix}${line.innerText}`;
    })
    .join("\n");

  return text;
}
