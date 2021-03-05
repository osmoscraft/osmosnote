import type { ApiService } from "../../services/api/api.service.js";
import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import type { HistoryService } from "./history/history.service.js";
import type { NotificationService } from "../../services/notification/notification.service.js";
import type { RemoteClientService } from "../../services/remote/remote-client.service.js";
import type { RouteService } from "../../services/route/route.service.js";
import type { WindowRefService } from "../../services/window-reference/window.service.js";
import type { CaretService } from "./caret.service.js";
import type { EditService } from "./edit.service.js";
import type { FormatService } from "./format.service.js";
import type { TrackChangeService } from "./track-change.service.js";

export class InputService {
  constructor(
    private caretService: CaretService,
    private editService: EditService,
    private historyService: HistoryService,
    private trackChangeService: TrackChangeService,
    private noteService: ApiService,
    private routeService: RouteService,
    private notificationService: NotificationService,
    private componentRefService: ComponentRefService,
    private formatService: FormatService,
    private windowRef: WindowRefService,
    private remoteClientService: RemoteClientService
  ) {}

  init(host: HTMLElement) {
    host.addEventListener("focus", () => this.handleFocusEvent());

    // selection events
    document.addEventListener("selectionchange", () => this.handleSelectionChangeEvent(host));

    // mouse events
    host.addEventListener("click", (event) => this.handleClickEvents(event, host));

    // clipboard
    host.addEventListener("copy", (event) => this.handleClipboardEvents(event, host));
    host.addEventListener("cut", (event) => this.handleClipboardEvents(event, host));
    host.addEventListener("paste", (event) => this.handleClipboardEvents(event, host));

    // special keyboard events: shortcut, whitespace
    host.addEventListener("keydown", (e) => this.handleKeydownEvents(e, host));

    // literal keyboard events
    host.addEventListener("beforeinput", (e) => this.handleBeforeInputEvent(e as InputEvent, host));
  }

  private handleFocusEvent() {
    // note, focus event fires before selection change
    this.caretService.restoreCaretFocusFromModel();
  }

  private async handleSelectionChangeEvent(host: HTMLElement) {
    // if selection leaves host, no op
    if (this.caretService.isCaretInElement(host)) {
      this.caretService.catchUpToDom();
    }
  }

  private async handleClickEvents(event: MouseEvent, host: HTMLElement) {
    // if clicked on interactive element, trigger the action
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

      // Global shortcuts
      case "s": // save
        if (event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          this.formatService.parseDocument(host);
          const lines = [...host.querySelectorAll("[data-line]")] as HTMLElement[];
          const note = this.formatService.getPortableText(lines);
          // TODO ensure any required metadata fields, e.g. title and ctime

          const { id } = this.routeService.getNoteConfigFromUrl();
          try {
            if (id) {
              this.noteService.updateNote(id, note);
              this.historyService.save(host);
              this.trackChangeService.set(this.historyService.peek()!.textContent, false);
              this.notificationService.displayMessage("Saved");
            } else {
              const result = await this.noteService.createNote(note);
              this.remoteClientService.notifyNoteCreated({ id: result.id, title: result.title });

              this.trackChangeService.set(this.historyService.peek()!.textContent, false);
              location.href = `/?id=${result.id}`;
            }
          } catch (error) {
            this.notificationService.displayMessage("Error saving note");
          }
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
          this.historyService.runAtomic(host, () => this.editService.insertNewLine(host));
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
