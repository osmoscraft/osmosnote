import { S2_LINK_REGEX } from "../../components/content-editor/core/link.component";
import { emit } from "../../utils/events";

declare global {
  interface GlobalEventHandlersEventMap {
    "cursor-selection:change": CustomEvent<CursorSelection>;
  }
}

export interface CursorSelection {
  linkId: string | null;
}

interface LinkWithRange {
  id: string;
  range: SimpleRange;
}

interface SimpleRange {
  start: number;
  end: number;
}

export class CursorSelectionService {
  eventTarget = new EventTarget() as HTMLElement; // cast to HTMLElement to get typing information

  private currentSelection: CursorSelection = {
    linkId: null,
  };

  init() {
    document.addEventListener("selectionchange", (event) => {
      const selection = getSelection();
      const cursorRange = selection?.getRangeAt(0);

      if (cursorRange?.commonAncestorContainer instanceof Text) {
        const rawText = cursorRange.commonAncestorContainer?.textContent;
        if (rawText) {
          const links = this.getPatternRanges(rawText);
          // for each link, if cursor falls within, emit found event
          const selectedLink = links.find(
            (link) => cursorRange.startOffset > link.range.start && cursorRange.endOffset < link.range.end
          );

          let eventDetail: CursorSelection;

          if (selectedLink) {
            eventDetail = {
              linkId: selectedLink.id,
            };
          } else {
            eventDetail = {
              linkId: null,
            };
          }

          if (JSON.stringify(eventDetail) !== JSON.stringify(this.currentSelection)) {
            this.currentSelection = { ...eventDetail };
            console.log(`[cursor-selection] changed `, eventDetail);

            emit(this.eventTarget, "cursor-selection:change", {
              detail: eventDetail,
            });
          }
        }
      }
    });
  }

  private getPatternRanges(text: string): LinkWithRange[] {
    const linkPattern = S2_LINK_REGEX;
    const matchResult = text.matchAll(linkPattern);
    const linksWithRange: LinkWithRange[] = [...matchResult].map((result) => ({
      id: result[2], // second capture group is id
      range: {
        start: result.index!,
        end: result.index! + result[0].length,
      },
    }));

    return linksWithRange;
  }
}
