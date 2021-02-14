export interface IsEqual<T> {
  (before: T, after: T): boolean;
}

export class HistoryStack<T = string> {
  private stack: T[] = [];
  private currentIndex = -1;

  get length() {
    return this.stack.length;
  }

  /**
   * This will wipe out future versions
   */
  push(value: T) {
    this.stack = this.stack.slice(0, this.currentIndex + 1); // remove future
    this.stack.push(value);
    this.currentIndex = this.stack.length - 1;
  }

  /**
   * This will wipe out current and future verions
   */
  replace(value: T) {
    this.stack = this.stack.slice(0, this.currentIndex);
    this.stack.push(value);
  }

  peek(): T | null {
    if (this.currentIndex < 0) return null;
    return this.stack[this.currentIndex];
  }

  undo(): T | null {
    if (this.currentIndex === -1) return null; // not initialized
    if (this.currentIndex === 0) return null; // already at earliest version

    return this.stack[--this.currentIndex];
  }

  redo(): T | null {
    if (this.currentIndex === -1) return null; // not initialized
    if (this.currentIndex === this.stack.length - 1) return null; // already at latest

    return this.stack[++this.currentIndex];
  }
}
