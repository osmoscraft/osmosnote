import type { EngineModel } from "../engine-model";

export function modelToDraftText(model: EngineModel): string {
  const text = model.lines
    .map((line, i) => {
      if (line.isFormatNeeded) return line.raw;

      const layoutPadding = " ".repeat(line.indentation);
      const headingPrefix = line.isHeading ? `${"#".repeat(line.sectionLevel)} ` : "";

      return `${layoutPadding}${headingPrefix}${line.innerText}`;
    })
    .join("\n");

  return text;
}
