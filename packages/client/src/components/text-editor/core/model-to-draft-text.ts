import type { SemanticModel } from "./core";

export function modelToDraftText(model: SemanticModel): string {
  const text = model.lines
    .map((line, i) => {
      const layoutPadding = " ".repeat(line.layoutPadding);
      const headingPrefix = line.isHeading ? `${"#".repeat(line.sectionLevel)} ` : "";

      return `${layoutPadding}${headingPrefix}${line.innerText}`;
    })
    .join("\n");

  return text;
}
