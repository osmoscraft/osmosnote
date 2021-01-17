export class HistoryService {
  private stack: string[] = [];
  private currentIndex = -1;

  get length() {
    return this.stack.length;
  }

  constructor() {
    (window as any).historyService = this;
  }

  /**
   * This will wipe out future versions
   */
  push(value: string) {
    // ensure uniqueness
    if (value === this.stack[this.currentIndex]) return;

    this.stack = this.stack.slice(0, this.currentIndex + 1);
    this.stack.push(value);
    this.currentIndex = this.stack.length - 1;
  }

  /**
   * This will wipe out current and future verions
   */
  replace(value: string) {
    this.stack = this.stack.slice(0, this.currentIndex);
    this.stack.push(value);
  }

  peek(): string | null {
    return this.stack[this.currentIndex];
  }

  undo(): string | null {
    if (this.currentIndex === -1) return null; // not initialized
    if (this.currentIndex === 0) return null; // already at earliest version

    return this.stack[--this.currentIndex];
  }

  redo(): string | null {
    if (this.currentIndex === -1) return null; // not initialized
    if (this.currentIndex === this.stack.length - 1) return null; // already at latest

    return this.stack[++this.currentIndex];
  }
}
