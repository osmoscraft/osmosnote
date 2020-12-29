import { HEADING_PATTERN, EngineModelLine, EngineModel } from "../engine-model";

export function fileTextToModel(fileText: string): EngineModel {
  // enforce unix style line ending.
  const rawLines = fileText.replaceAll("\r", "").split("\n");

  const parserContext = {
    isHeading: false,
    indentation: 0,
    currentSectionLevel: 0,
    innerText: "",
    isEmpty: true,
  };

  const resultLines: EngineModelLine[] = [];

  rawLines.forEach((line) => {
    // reset context
    parserContext.isHeading = false;
    parserContext.innerText = line;
    parserContext.isEmpty = !line.length;

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      parserContext.isHeading = true;
      parserContext.currentSectionLevel = headingMatch[1].length; // number of "#"
      parserContext.innerText = headingMatch[2];
    }

    parserContext.indentation = parserContext.isHeading
      ? parserContext.currentSectionLevel - 1
      : parserContext.currentSectionLevel * 2;

    const headingPrefix = parserContext.isHeading ? `${"#".repeat(parserContext.currentSectionLevel)} ` : "";
    const draftRaw = `${parserContext.indentation}${headingPrefix}${parserContext.innerText}`;

    resultLines.push({
      fileRaw: line,
      draftRaw,
      innerText: parserContext.innerText,
      isEmpty: parserContext.isEmpty,
      isHeading: parserContext.isHeading,
      isListItem: false, // TODO implement
      indentation: parserContext.indentation,
      listItemLevel: 0, // TODO implement
      sectionLevel: parserContext.currentSectionLevel,
      isFormatNeeded: false,
    });
  });

  return {
    lines: resultLines,
  };
}
