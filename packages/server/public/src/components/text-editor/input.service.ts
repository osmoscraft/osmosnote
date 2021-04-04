import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import type { WindowRefService } from "../../services/window-reference/window.service.js";
import { isUrl } from "../../utils/url.js";
import type { CaretService } from "./caret.service.js";
import type { EditService } from "./edit.service.js";
import type { HistoryService } from "./history/history.service.js";
import type { LineQueryService } from "./line-query.service.js";
import type { TrackChangeService } from "./track-change.service.js";

export class InputService {
  private isMouseDown = false;

  constructor(
    private caretService: CaretService,
    private editService: EditService,
    private lineQueryService: LineQueryService,
    private historyService: HistoryService,
    private trackChangeService: TrackChangeService,
    private componentRefService: ComponentRefService,
    private windowRef: WindowRefService
  ) {}

  init(host: HTMLElement) {
    // mouse events: mousedown happens before selection change
    host.addEventListener("mousedown", (event) => this.handleMouseDownEvent(event));
    host.addEventListener("mouseup", (event) => this.handleMouseUpEvent(event));

    // selection events
    document.addEventListener("selectionchange", (e) => this.handleSelectionChangeEvent(e, host));

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
    this.isMouseDown = true;

    const noteLink = (event.target as HTMLElement)?.closest(`[data-title-target]`) as HTMLElement;
    if (noteLink) {
      // open internal id link
      this.openTitleTarget(noteLink.dataset.titleTarget!, event);
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

  private async handleMouseUpEvent(event: MouseEvent) {
    this.isMouseDown = false;
  }

  private async handleSelectionChangeEvent(e: Event, host: HTMLElement) {
    // if selection leaves host, no op
    if (this.caretService.isCaretInElement(host)) {
      // Do not save ideal column unless selection change is caused by mouse down.
      const updateIdealColumn = this.isMouseDown;
      this.caretService.catchUpToDom(updateIdealColumn);
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
        } else if (event.altKey) {
          this.editService.shiftLinesDown();
        } else {
          this.caretService.moveDown(host);
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (event.shiftKey) {
          this.caretService.selectUp(host);
        } else if (event.altKey) {
          this.editService.shiftLinesUp();
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

      case "Escape":
        if (!event.ctrlKey && !event.shiftKey) {
          event.preventDefault();
          this.caretService.collapseToFocus(host);
        }
        break;

      // Inputs
      case "Delete":
        if (event.ctrlKey) {
          await this.historyService.runAtomic(host, () => this.editService.deleteWordAfter(host));
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        } else {
          await this.historyService.runAtomic(host, () => this.editService.deleteAfter(host));
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        }
        event.preventDefault();
        break;

      case "Backspace":
        if (event.ctrlKey) {
          await this.historyService.runAtomic(host, () => this.editService.deleteWordBefore(host));
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        } else {
          await this.historyService.runAtomic(host, () => this.editService.deleteBefore(host));
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        }
        event.preventDefault();
        break;

      case "Enter": // Enter
        this.handleEnterKeydown(event, host);
        break;
    }
  }

  private handleBeforeInputEvent(event: InputEvent, host: HTMLElement) {
    if (event.inputType !== "insertText") {
      // currently, only current plaintext input.
      // add more types in the future to support: italic, bold, underline, or composing input (CJK)
      event.preventDefault();
      return;
    }

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

  private async handleEnterKeydown(event: KeyboardEvent, host: HTMLElement) {
    // Open link
    const collapsedCaretParents = [...host.querySelectorAll(`[data-caret-collapsed]`)].reverse() as HTMLElement[];
    for (let container of collapsedCaretParents) {
      if (container.dataset.titleTarget) {
        this.openTitleTarget(container.dataset.titleTarget, event);
        event.preventDefault();
        break;
      } else if (container.dataset.url) {
        // open external url
        this.openUrl(container.dataset.url, event);
        event.preventDefault();
        break;
      }
    }

    // Insert new line
    if (!event.defaultPrevented) {
      const caretContext = this.caretService.getCaretContext();
      if (!caretContext) return;

      const { lineCollapsed, textAfter, textBefore, textSelected } = caretContext;

      // enter at line end
      if (lineCollapsed && textSelected === "" && textAfter === "") {
        const lineType = lineCollapsed.dataset.line;

        if (lineType === "list") {
          if (lineCollapsed.dataset.listEmpty === "") {
            // Empty list item: replace all text with space
            await this.historyService.runAtomic(host, () => {
              // TODO implement replaceCurrentLineWithText
              this.caretService.selectHome(host);
              this.editService.insertText(" ".repeat(textBefore.length), host);
            });
          } else {
            // Non-empty item: create a new item at the same level
            const { indent } = this.lineQueryService.getLineMetrics(lineCollapsed);
            const hiddenHyphens = "-".repeat(parseInt(lineCollapsed.dataset.listLevel!) - 1);

            let newListMarker: string;
            if (lineCollapsed.dataset.list === "unordered") {
              newListMarker = lineCollapsed.dataset.listMarker!;
            } else {
              newListMarker = `${parseInt(lineCollapsed.dataset.listMarker!.replace(".", "")) + 1}.`;
            }

            await this.historyService.runAtomic(host, () => {
              this.editService.insertBelow(host, " ".repeat(indent) + hiddenHyphens + newListMarker + " ");
            });
          }
        } else if (lineType === "heading") {
          const { indent } = this.lineQueryService.getLineMetrics(lineCollapsed);
          const headingPrefixLength = parseInt(lineCollapsed.dataset.headingLevel!) + 1; // number of hash + space

          await this.historyService.runAtomic(host, () => {
            this.editService.insertBelow(host, " ".repeat(indent + headingPrefixLength));
          });
        } else {
          const { indent } = this.lineQueryService.getLineMetrics(lineCollapsed);

          await this.historyService.runAtomic(host, () => {
            this.editService.insertBelow(host, " ".repeat(indent));
          });
        }

        this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        event.preventDefault();
        return;
      }

      // enter when there is selection
      await this.historyService.runAtomic(host, () => this.editService.insertNewLine(host));
      this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
      event.preventDefault();
    }
  }

  private openTitleTarget(target: string, event: KeyboardEvent | MouseEvent) {
    if (isUrl(target)) {
      this.openUrl(target, event);
    } else {
      this.openNodeId(target, event);
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
