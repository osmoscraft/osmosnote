import type { CaretService } from "../../components/text-editor/caret.service.js";
import type { LineElement } from "../../components/text-editor/helpers/source-to-lines.js";
import type { LineQueryService } from "../../components/text-editor/line-query.service.js";
import { HistoryStack } from "./history-stack.js";

export interface Snapshot {
  documentHtml: string;
  textContent: string;
  cursorLineIndex: number;
  cursorLineOffset: number;
}

const compareSnapshots = (a: Snapshot | null, b: Snapshot | null) => {
  return (
    a?.textContent === b?.textContent &&
    a?.cursorLineIndex === b?.cursorLineIndex &&
    a?.cursorLineOffset === b?.cursorLineOffset
  );
};

export class HistoryService {
  private stack = new HistoryStack<Snapshot>();

  constructor(private caretService: CaretService, private lineQueryService: LineQueryService) {}

  save(root: HTMLElement) {
    const snapshot = this.getSnapshot(root);
    const current = this.stack.peek();

    if (compareSnapshots(current, snapshot)) {
      return;
    }

    this.stack.push(snapshot);
  }

  async runAtomic(root: HTMLElement, action: () => any) {
    this.save(root);
    await action();
    this.save(root);
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

    // restore cursor
    const lines = [...root.querySelectorAll("[data-line]")] as HTMLElement[];
    const cursorLine = lines[snapshot.cursorLineIndex];
    const cursorPosition = this.lineQueryService.getPositionByOffset(cursorLine, snapshot.cursorLineOffset);

    return this.caretService.setCollapsedCaretToLinePosition({
      line: cursorLine,
      position: {
        ...cursorPosition,
      },
      root,
      rememberColumn: true,
    });
  }

  private getSnapshot(root: HTMLElement): Snapshot {
    const lines = [...root.querySelectorAll("[data-line]")] as LineElement[];

    const documentHtml = root.innerHTML;
    const textContent = root.textContent ?? "";

    const cursor = this.caretService.caret;
    if (cursor) {
      const currentLine = this.lineQueryService.getLine(cursor.focus.node)! as LineElement;
      const { offset: cursorOffset } = this.caretService.getCaretLinePosition(cursor.focus);

      return {
        documentHtml: documentHtml,
        textContent,
        cursorLineIndex: lines.indexOf(currentLine),
        cursorLineOffset: cursorOffset,
      };
    } else {
      return {
        documentHtml: documentHtml,
        textContent,
        cursorLineIndex: 0,
        cursorLineOffset: 0,
      };
    }
  }
}
