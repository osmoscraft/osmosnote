import { getSnapshot } from "./helpers/get-snapshot.js";
import { HistoryStack } from "./helpers/history-stack.js";
import { restoreSnapshot } from "./helpers/restore-snapshot.js";

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

  save(root: HTMLElement) {
    const snapshot = getSnapshot(root);
    const current = this.stack.peek();

    if (compareSnapshots(current, snapshot)) {
      return;
    }

    this.stack.push(snapshot);
  }

  undo(root: HTMLElement) {
    // before undo, always save, in case this is unsaved changes
    this.save(root);

    const snapshot = this.stack.undo();

    if (snapshot) {
      restoreSnapshot(snapshot, root);
    }
  }

  redo(root: HTMLElement) {
    const snapshot = this.stack.redo();
    if (!snapshot) return;

    restoreSnapshot(snapshot, root);
  }

  peek() {
    return this.stack.peek();
  }
}
