import { LINK_PATTERN } from "../../components/text-editor/overlay/parts/line-overlay.component";
import { emit } from "../../utils/events";
import type { ComponentReferenceService } from "../component-reference/component-reference.service";

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
  constructor(private componentRefs: ComponentReferenceService) {}

  eventTarget = new EventTarget() as HTMLElement; // cast to HTMLElement to get typing information

  private currentSelection: CursorSelection = {
    linkId: null,
  };

  getCurrentSelection(): CursorSelection {
    return this.currentSelection;
  }

  init() {
    this.componentRefs.textEditor.addEventListener("text-editor:model-changed", (event) => {
      const { startCol, startRow, endCol, endRow } = event.detail.cursor;

      let eventDetail: CursorSelection = {
        linkId: null,
      };

      // only support single line link detection
      if (startRow === endRow) {
        const rowContent = event.detail.lines[startRow].draftRaw;
        const links = this.getPatternRanges(rowContent);

        const selectedLink = links.find((link) => startCol > link.range.start && endCol < link.range.end);

        if (selectedLink) {
          eventDetail.linkId = selectedLink.id;
        }
      }

      if (JSON.stringify(eventDetail) !== JSON.stringify(this.currentSelection)) {
        this.currentSelection = { ...eventDetail };
        console.log(`[cursor-selection] changed `, eventDetail);

        emit(this.eventTarget, "cursor-selection:change", {
          detail: eventDetail,
        });
      }
    });
  }

  private getPatternRanges(text: string): LinkWithRange[] {
    const linkPattern = LINK_PATTERN;
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
