import type { CaretService } from "../caret.service.js";
import type { LineElement } from "../helpers/source-to-lines.js";
import type { LineQueryService } from "../line-query.service.js";
import type { TrackChangeService } from "../track-change.service.js";
import { HistoryStack } from "./history-stack.js";

export interface Snapshot {
  documentHtml: string;
  textContent: string;
  caretLineIndex: number;
  caretLineOffset: number;
}

const compareSnapshots = (a: Snapshot | null, b: Snapshot | null) => {
  return (
    a?.textContent === b?.textContent &&
    a?.caretLineIndex === b?.caretLineIndex &&
    a?.caretLineOffset === b?.caretLineOffset
  );
};

export class HistoryService {
  private stack = new HistoryStack<Snapshot>();

  constructor(
    private caretService: CaretService,
    private lineQueryService: LineQueryService,
    private trackChangeService: TrackChangeService
  ) {}

  save(root: HTMLElement) {
    const snapshot = this.getSnapshot(root);
    const current = this.stack.peek();

    if (compareSnapshots(current, snapshot)) {
      return;
    }

    this.stack.push(snapshot);
  }

  /** Create a snapshot in history, mutation content, create a new snapshot, and update dirty status */
  async runAtomic(root: HTMLElement, action: () => any) {
    this.save(root);
    await action();
    this.save(root);
    this.trackChangeService.trackByText(this.peek()?.textContent);
  }

  undo(root: HTMLElement) {
    // before undo, always save, in case this is unsaved changes
    this.save(root);

    const snapshot = this.stack.undo();

    if (snapshot) {
      this.restoreSnapshot(snapshot, root);
    }
  }

  redo(root: HTMLElement) {
    const snapshot = this.stack.redo();
    if (!snapshot) return;

    this.restoreSnapshot(snapshot, root);
  }

  peek() {
    return this.stack.peek();
  }

  private restoreSnapshot(snapshot: Snapshot, root: HTMLElement) {
    // restore dom
    root.innerHTML = snapshot.documentHtml;

    // restore caret
    const lines = [...root.querySelectorAll("[data-line]")] as HTMLElement[];
    const caretLine = lines[snapshot.caretLineIndex];
    const caretPosition = this.lineQueryService.getPositionByOffset(caretLine, snapshot.caretLineOffset);

    return this.caretService.setCollapsedCaretToLinePosition({
      line: caretLine,
      position: {
        ...caretPosition,
      },
      root,
      rememberColumn: true,
    });
  }

  private getSnapshot(root: HTMLElement): Snapshot {
    const lines = [...root.querySelectorAll("[data-line]")] as LineElement[];

    const documentHtml = root.innerHTML;
    const textContent = root.textContent ?? "";

    const caret = this.caretService.caret;
    if (caret) {
      const currentLine = this.lineQueryService.getLine(caret.focus.node)! as LineElement;
      const { offset: caretOffset } = this.caretService.getCaretLinePosition(caret.focus);

      return {
        documentHtml: documentHtml,
        textContent,
        caretLineIndex: lines.indexOf(currentLine),
        caretLineOffset: caretOffset,
      };
    } else {
      return {
        documentHtml: documentHtml,
        textContent,
        caretLineIndex: 0,
        caretLineOffset: 0,
      };
    }
  }
}
