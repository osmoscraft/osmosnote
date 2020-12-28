import { HEADING_PATTERN, SemanticLine, SemanticModel } from "./core";

export function draftTextToModel(draftText: string, fixFormat?: boolean): SemanticModel {
  // assumption: line ends are normalized to unix style
  const rawLines = draftText.split("\n");

  const parserContext = {
    isHeading: false,
    layoutPadding: 0,
    currentSectionLevel: 0,
    innerText: "",
    isEmpty: true,
    isInvalid: false,
  };

  const resultLines: SemanticLine[] = [];

  rawLines.forEach((line) => {
    // reset context
    parserContext.isHeading = false;
    parserContext.innerText = "";

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
      const currentPadding = line.length - line.trimStart().length;

      // invalid padding
      if (currentPadding !== parserContext.layoutPadding) {
        parserContext.isInvalid = true;

        if (fixFormat) {
          const padding = " ".repeat(parserContext.layoutPadding);
          line = padding + line.trimStart();
          parserContext.isInvalid = false;
        }
      }

      if (!parserContext.isInvalid) {
        parserContext.innerText = line.slice(parserContext.layoutPadding); // trim leading space when valid
      }
    }

    const headingPrefix = parserContext.isHeading ? `${"#".repeat(parserContext.currentSectionLevel)} ` : "";
    const raw = parserContext.isInvalid ? line : `${headingPrefix}${parserContext.innerText}`;

    parserContext.isEmpty = !raw.length;

    resultLines.push({
      raw,
      innerText: parserContext.innerText,
      isEmpty: parserContext.isEmpty,
      isHeading: parserContext.isHeading,
      isListItem: false, // TODO implement
      layoutPadding: parserContext.layoutPadding,
      listItemLevel: 0, // TODO implement
      sectionLevel: parserContext.currentSectionLevel,
      isInvalid: parserContext.isInvalid,
    });
  });

  return {
    lines: resultLines,
  };
}
