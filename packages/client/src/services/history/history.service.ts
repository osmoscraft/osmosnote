export class HistoryService {
  private stack: string[] = [];
  private currentIndex = -1;

  push(value: string) {
    this.stack.push(value);
    this.currentIndex = this.stack.length - 1;
  }

  undo(): string | null {
    if (this.currentIndex === -1) return null; // not initialized
    if (this.currentIndex === 0) return null; // already at earliest version

    this.currentIndex--;
    return this.stack[this.currentIndex];
  }

  redo(): string | null {
    if (this.currentIndex === -1) return null; // not initialized
    if (this.currentIndex === this.stack.length - 1) return null; // already at latest

    this.currentIndex++;
    return this.stack[this.currentIndex];
  }
}
