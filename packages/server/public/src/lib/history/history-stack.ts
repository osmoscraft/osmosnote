export interface IsEqual<T> {
  (before: T, after: T): boolean;
}

export class HistoryStack<T = string> {
  private pastStack: T[] = [];
  private present: T | null = null;
  private futureStack: T[] = [];

  push(value: T) {
    if (this.present) {
      this.pastStack.push(this.present);
    }
    this.present = value;

    this.futureStack = [];
  }

  peek(): T | null {
    return this.present;
  }

  undo(): T | null {
    if (!this.present) return null;

    const past = this.pastStack.pop();
    if (!past) return null;

    this.futureStack.push(this.present);
    this.present = past;

    return this.present;
  }

  redo(): T | null {
    if (!this.present) return null;

    const future = this.futureStack.pop();
    if (!future) return null;

    this.pastStack.push(this.present);
    this.present = future;

    return this.present;
  }
}
