export interface CursorSnapshot {
  range: Range | null;
  activeElement: Node | null;
}

export interface WithCursorSnapshotService extends HTMLElement {
  cursorSnapshotService: CursorSnapshotService;
}

export class CursorSnapshotService {
  private restorePoint?: CursorSnapshot;

  attach(host: WithCursorSnapshotService) {
    host.dataset.managedCursor = "";

    host.addEventListener("focus", (event) => {
      if (host.cursorSnapshotService.restorePoint) {
        host.cursorSnapshotService.restore();
      }
    });
  }

  save() {
    const range = this.getRange();
    const activeElement = document.activeElement;
    const rangeInFocus = range && activeElement && activeElement.contains(range.commonAncestorContainer);

    const restorePoint: CursorSnapshot = {
      range: rangeInFocus ? range : null,
      activeElement,
    };

    console.log("[cursor-snapshot] save", restorePoint);
    this.restorePoint = restorePoint;
  }

  restore() {
    const restorePoint = this.restorePoint;
    console.log("[cursor-snapshot] restore", restorePoint);

    if (restorePoint) {
      if (restorePoint?.activeElement) {
        (restorePoint?.activeElement as HTMLElement)?.focus();
      }

      if (restorePoint?.range) {
        this.setRange(restorePoint.range);
      }
    }
  }

  private getRange(): Range | null {
    const selection = getSelection();
    const range = selection?.rangeCount ? selection?.getRangeAt(0) : undefined;
    return range ?? null;
  }

  private setRange(range: Range) {
    const selection = getSelection();

    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      return selection;
    }
  }
}
