import { HEADING_PATTERN, EngineModelLine, EngineModel } from "../engine-model";

export function draftTextToModel(draftText: string, fixFormat?: boolean): EngineModel {
  // assumption: line ends are normalized to unix style
  const rawLines = draftText.split("\n");

  const parserContext = {
    isHeading: false,
    indentation: 0,
    currentSectionLevel: 0,
    innerText: "",
    isEmpty: true,
    isInvalid: false,
  };

  const resultLines: EngineModelLine[] = [];

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

    parserContext.indentation = parserContext.isHeading
      ? parserContext.currentSectionLevel - 1
      : parserContext.currentSectionLevel * 2;

    if (!headingMatch) {
      const currentPadding = line.length - line.trimStart().length;

      // invalid padding
      if (currentPadding !== parserContext.indentation) {
        parserContext.isInvalid = true;

        if (fixFormat) {
          const padding = " ".repeat(parserContext.indentation);
          line = padding + line.trimStart();
          parserContext.isInvalid = false;
        }
      }

      if (!parserContext.isInvalid) {
        parserContext.innerText = line.slice(parserContext.indentation); // trim leading space when valid
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
      indentation: parserContext.indentation,
      listItemLevel: 0, // TODO implement
      sectionLevel: parserContext.currentSectionLevel,
      isFormatNeeded: parserContext.isInvalid,
    });
  });

  return {
    lines: resultLines,
  };
}
