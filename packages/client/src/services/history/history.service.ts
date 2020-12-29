export class HistoryService {
  private stack: string[] = [];
  private currentIndex = -1;

  push(value: string) {
    // ensure uniqueness
    if (value === this.stack[this.currentIndex]) return;

    this.stack = this.stack.slice(0, this.currentIndex + 1);
    this.stack.push(value);
    this.currentIndex = this.stack.length - 1;
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
