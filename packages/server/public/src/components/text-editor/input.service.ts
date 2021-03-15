import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import type { WindowRefService } from "../../services/window-reference/window.service.js";
import type { CaretService } from "./caret.service.js";
import type { EditService } from "./edit.service.js";
import type { HistoryService } from "./history/history.service.js";
import type { SyncService } from "./sync.service.js";
import type { TrackChangeService } from "./track-change.service.js";

export class InputService {
  constructor(
    private caretService: CaretService,
    private editService: EditService,
    private historyService: HistoryService,
    private trackChangeService: TrackChangeService,
    private componentRefService: ComponentRefService,
    private windowRef: WindowRefService,
    private syncService: SyncService
  ) {}

  init(host: HTMLElement) {
    // mouse events: mousedown happens before selection change
    host.addEventListener("mousedown", (event) => this.handleMouseDownEvent(event));

    // selection events
    document.addEventListener("selectionchange", () => this.handleSelectionChangeEvent(host));

    // clipboard
    host.addEventListener("copy", (event) => this.handleClipboardEvents(event, host));
    host.addEventListener("cut", (event) => this.handleClipboardEvents(event, host));
    host.addEventListener("paste", (event) => this.handleClipboardEvents(event, host));

    // special keyboard events: shortcut, whitespace
    host.addEventListener("keydown", (e) => this.handleKeydownEvents(e, host));

    // literal keyboard events
    host.addEventListener("beforeinput", (e) => this.handleBeforeInputEvent(e as InputEvent, host));
  }

  private async handleMouseDownEvent(event: MouseEvent) {
    const noteLink = (event.target as HTMLElement)?.closest(`[data-note-id]`) as HTMLElement;
    if (noteLink) {
      // open internal id link
      this.openNodeId(noteLink.dataset.noteId!, event);
      event.preventDefault();
      return;
    }

    const urlLink = (event.target as HTMLElement)?.closest(`[data-url]`) as HTMLElement;
    if (urlLink) {
      // open external url
      this.openUrl(urlLink.dataset.url!, event);
      event.preventDefault();
      return;
    }
  }

  private async handleSelectionChangeEvent(host: HTMLElement) {
    // if selection leaves host, no op
    if (this.caretService.isCaretInElement(host)) {
      this.caretService.catchUpToDom();
    }
  }

  private async handleClipboardEvents(event: ClipboardEvent, host: HTMLElement) {
    event.preventDefault();
    switch (event.type) {
      case "copy":
        this.editService.caretCopy();
        break;
      case "cut":
        await this.historyService.runAtomic(host, () => this.editService.caretCut(host));
        this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        break;
      case "paste":
        const pasteText = event.clipboardData?.getData("text");
        if (!pasteText) return;

        await this.historyService.runAtomic(host, () => this.editService.caretPaste(pasteText, host));
        this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        break;
    }
  }

  private async handleKeydownEvents(event: KeyboardEvent, host: HTMLElement) {
    switch (event.key) {
      // undo/redo
      case "z":
        if (event.ctrlKey && !event.shiftKey) {
          this.historyService.undo(host);
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
          event.preventDefault();
        }
        break;

      case "Z":
        if (event.ctrlKey && event.shiftKey) {
          this.historyService.redo(host);
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
          event.preventDefault();
        }
        break;

      // command bar
      case " ":
        if (event.ctrlKey) {
          this.componentRefService.commandBar.enterCommandMode();
          event.preventDefault();
        }
        break;

      // select all
      case "a":
        if (event.ctrlKey) {
          event.preventDefault();
          this.caretService.selectAll(host);
        }
        break;

      // cut empty line
      case "x":
        if (event.ctrlKey) {
          event.preventDefault();
          await this.historyService.runAtomic(host, () => this.editService.caretCut(host));
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        }
        break;

      // Command bar short cuts
      // TODO refactor into command bar
      case "s": // save
        if (event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          await this.componentRefService.commandBar.enterCommandMode("fs");
        }
        break;

      case "k": // link to
        if (event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          await this.componentRefService.commandBar.enterCommandMode("k");
        }
        break;

      case "o": // open
        if (event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          await this.componentRefService.commandBar.enterCommandMode("o");
        }
        break;

      // Caret movement
      case "ArrowLeft":
        if (event.altKey) break;

        event.preventDefault();
        if (!event.ctrlKey && !event.shiftKey) {
          this.caretService.moveLeft(host);
        } else if (!event.ctrlKey && event.shiftKey) {
          this.caretService.selectLeft(host);
        } else if (event.ctrlKey && !event.shiftKey) {
          this.caretService.moveWordStart(host);
        } else if (event.ctrlKey && event.shiftKey) {
          this.caretService.selectWordStart(host);
        }
        break;

      case "ArrowRight":
        if (event.altKey) break;

        event.preventDefault();
        if (!event.ctrlKey && !event.shiftKey) {
          this.caretService.moveRight(host);
        } else if (!event.ctrlKey && event.shiftKey) {
          this.caretService.selectRight(host);
        } else if (event.ctrlKey && !event.shiftKey) {
          this.caretService.moveWordEnd(host);
        } else if (event.ctrlKey && event.shiftKey) {
          this.caretService.selectWordEnd(host);
        }
        break;

      case "Home":
        event.preventDefault();
        if (!event.shiftKey) {
          this.caretService.moveHome(host);
        } else if (event.shiftKey) {
          this.caretService.selectHome(host);
        }
        break;

      case "End":
        event.preventDefault();
        if (!event.shiftKey) {
          this.caretService.moveEnd(host);
        } else if (event.shiftKey) {
          this.caretService.selectEnd(host);
        }
        break;

      case "ArrowDown":
        event.preventDefault();
        if (event.shiftKey) {
          this.caretService.selectDown(host);
        } else {
          this.caretService.moveDown(host);
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (event.shiftKey) {
          this.caretService.selectUp(host);
        } else {
          this.caretService.moveUp(host);
        }
        break;

      case "PageDown":
        event.preventDefault();
        if (event.shiftKey) {
          this.caretService.selectBlockEnd(host);
        } else {
          this.caretService.moveBlockEnd(host);
        }
        break;

      case "PageUp":
        event.preventDefault();
        if (event.shiftKey) {
          this.caretService.selectBlockStart(host);
        } else {
          this.caretService.moveBlockStart(host);
        }
        break;

      // Inputs
      case "Delete":
        if (event.ctrlKey) {
          this.editService.deleteWordAfter(host);
          this.historyService.save(host);
        } else {
          this.editService.deleteAfter(host);
          this.historyService.save(host);
        }
        event.preventDefault();
        break;

      case "Backspace":
        if (event.ctrlKey) {
          this.editService.deleteWordBefore(host);
          this.historyService.save(host);
        } else {
          this.editService.deleteBefore(host);
          this.historyService.save(host);
        }
        event.preventDefault();
        break;

      case "Enter": // Enter
        const collapsedCaretParents = [...host.querySelectorAll(`[data-caret-collapsed]`)].reverse() as HTMLElement[];
        for (let container of collapsedCaretParents) {
          if (container.dataset.noteId) {
            // open internal id link
            this.openNodeId(container.dataset.noteId, event);
            event.preventDefault();
            break;
          } else if (container.dataset.url) {
            // open external url
            this.openUrl(container.dataset.url, event);
            event.preventDefault();
            break;
          }
        }

        if (!event.defaultPrevented) {
          // insert new line at point
          await this.historyService.runAtomic(host, () => this.editService.insertNewLine(host));
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
          event.preventDefault();
        }
        break;
    }
  }

  private handleBeforeInputEvent(event: InputEvent, host: HTMLElement) {
    const insertedText = event.data;
    if (insertedText) {
      event.preventDefault();
      this.editService.insertText(insertedText, host);
      this.trackChangeService.trackByState(true);

      if (insertedText.match(/\s|,|\./)) {
        this.historyService.save(host);
      }
    }
  }

  private openNodeId(id: string, event: KeyboardEvent | MouseEvent) {
    if (event.ctrlKey) {
      this.windowRef.window.open(`/?id=${id}`, id); // use id as window name
    } else {
      this.windowRef.window.open(`/?id=${id}`, "_self");
    }
  }

  private openUrl(url: string, event: KeyboardEvent | MouseEvent) {
    if (event.ctrlKey) {
      this.windowRef.window.open(url, url); // use url as window name
    } else {
      this.windowRef.window.open(url, "_self");
    }
  }
}
