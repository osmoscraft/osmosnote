interface RestorePoint {
  range: Range | null;
  activeElement: Node | null;
}

export class CursorService {
  private restorePoints: RestorePoint[] = [];

  push() {
    const range = this.getRange();
    const activeElement = document.activeElement;
    const rangeInFocus = range && activeElement && activeElement.contains(range.commonAncestorContainer);

    const restorePoint: RestorePoint = {
      range: rangeInFocus ? range : null,
      activeElement: document.activeElement,
    };

    console.log("[cursor] push", restorePoint);
    this.restorePoints.push(restorePoint);
  }

  pop() {
    const restorePoint = this.restorePoints.pop();
    console.log("[cursor] pop", restorePoint);

    if (restorePoint?.activeElement) {
      (restorePoint?.activeElement as HTMLElement)?.focus();
    }

    if (restorePoint?.range) {
      this.setRange(restorePoint.range);
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
