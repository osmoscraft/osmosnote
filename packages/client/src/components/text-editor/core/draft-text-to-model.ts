import { HEADING_PATTERN, SemanticLine, SemanticModel } from "./core";

export function draftTextToModel(draftText: string): SemanticModel {
  // assumption: line ends are normalized to unix style
  const rawLines = draftText.split("\n");

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

    const headingMatch = line.trimStart().match(HEADING_PATTERN);
    if (headingMatch) {
      parserContext.isHeading = true;
      parserContext.currentSectionLevel = headingMatch[1].length; // number of "#"
      parserContext.innerText = headingMatch[2];
    }

    parserContext.layoutPadding = parserContext.isHeading
      ? parserContext.currentSectionLevel - 1
      : parserContext.currentSectionLevel * 2;

    if (!headingMatch) {
      if (line.length > 0 && line.length < parserContext.layoutPadding) {
        // user has deleted into the padding. consider line as deleted
        return;
      }

      parserContext.innerText = line.slice(parserContext.layoutPadding); // trim leading space
    }

    const headingPrefix = parserContext.isHeading ? `${"#".repeat(parserContext.currentSectionLevel)} ` : "";
    const raw = `${headingPrefix}${parserContext.innerText}`;

    parserContext.isEmpty = !raw.length && !parserContext.layoutPadding;

    resultLines.push({
      raw,
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
