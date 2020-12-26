export interface CursorRestorePoint {
  range: Range | null;
  activeElement: Node | null;
}

export interface WithCursorService extends HTMLElement {
  cursorService: CursorService;
}

export class CursorService {
  private restorePoint?: CursorRestorePoint;

  attach(host: WithCursorService) {
    host.dataset.managedCursor = "";

    host.addEventListener("focus", (event) => {
      if (host.cursorService.restorePoint) {
        host.cursorService.restore();
      }
    });
  }

  save() {
    const range = this.getRange();
    const activeElement = document.activeElement;
    const rangeInFocus = range && activeElement && activeElement.contains(range.commonAncestorContainer);

    const restorePoint: CursorRestorePoint = {
      range: rangeInFocus ? range : null,
      activeElement,
    };

    console.log("[cursor] save", restorePoint);
    this.restorePoint = restorePoint;
  }

  restore() {
    const restorePoint = this.restorePoint;
    console.log("[cursor] restore", restorePoint);

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
    try {
      const selection = getSelection();
      const range = selection?.getRangeAt(0).cloneRange();
      return range ?? null;
    } catch (error) {
      return null;
    }
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
