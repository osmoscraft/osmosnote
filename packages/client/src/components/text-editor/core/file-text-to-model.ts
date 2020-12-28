import { HEADING_PATTERN, SemanticLine, SemanticModel } from "./core";

export function fileTextToModel(fileText: string): SemanticModel {
  // assumption: line ends are normalized to unix style
  const rawLines = fileText.split("\n");

  const parserContext = {
    isHeading: false,
    layoutPadding: 0,
    currentSectionLevel: 0,
    innerText: "",
    isEmpty: true,
  };

  const resultLines: SemanticLine[] = [];

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

    parserContext.layoutPadding = parserContext.isHeading
      ? parserContext.currentSectionLevel - 1
      : parserContext.currentSectionLevel * 2;

    resultLines.push({
      raw: line,
      innerText: parserContext.innerText,
      isEmpty: parserContext.isEmpty,
      isHeading: parserContext.isHeading,
      isListItem: false, // TODO implement
      layoutPadding: parserContext.layoutPadding,
      listItemLevel: 0, // TODO implement
      sectionLevel: parserContext.currentSectionLevel,
    });
  });

  return {
    lines: resultLines,
  };
}
