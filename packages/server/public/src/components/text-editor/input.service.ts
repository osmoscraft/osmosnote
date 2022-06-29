import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import type { WindowRefService } from "../../services/window-reference/window.service.js";
import { isUrl } from "../../utils/url.js";
import type { CaretService } from "./caret.service.js";
import { LIST_CONTROL_CHAR } from "./compiler/list.js";
import type { EditService } from "./edit.service.js";
import type { HistoryService } from "./history/history.service.js";
import type { LineQueryService } from "./line-query.service.js";
import type { TrackChangeService } from "./track-change.service.js";

export const BLOCKED_INPUT_TYPES = ["formatItalic", "formatBold", "formatUnderline"];
export const PASSTHROUGH_INPUT_TYPES = ["insertCompositionText"];

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
      this.caretService.catchUpToDom({ saveColumnAsIdeal: updateIdealColumn });
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
        break;
      case "paste":
        const pasteText = event.clipboardData?.getData("text");
        if (!pasteText) return;

        await this.historyService.runAtomic(host, () => this.editService.caretPaste(pasteText, host));
        break;
    }
  }

  private async handleKeydownEvents(event: KeyboardEvent, host: HTMLElement) {
    switch (event.key) {
      // undo/redo
      case "z":
        if (event.ctrlKey) {
          event.preventDefault();
          this.historyService.undo(host);
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        }
        break;
      case "Z":
        if (event.ctrlKey) {
          event.preventDefault();
          this.historyService.redo(host);
          this.trackChangeService.trackByText(this.historyService.peek()?.textContent);
        }
        break;

      // command bar
      case " ":
        if (event.ctrlKey) {
          event.preventDefault();
          this.componentRefService.commandBar.enterCommandMode();
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
        }
        break;

      // Command bar short cuts
      // TODO refactor into command bar
      case "s": // save
        if (event.ctrlKey) {
          // save only
          event.preventDefault();
          await this.componentRefService.commandBar.enterCommandMode("fs");
        }
        break;
      case "S": // save
        if (event.ctrlKey) {
          event.preventDefault();
          // save and sync all
          await this.componentRefService.commandBar.enterCommandMode("fa");
        }
        break;

      case "k": // link to
        if (event.ctrlKey) {
          event.preventDefault();
          await this.componentRefService.commandBar.enterCommandMode("k");
        }
        break;

      case "o": // open
        if (event.ctrlKey) {
          event.preventDefault();
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
        if (event.shiftKey && event.altKey) {
          await this.historyService.runAtomic(host, () => this.editService.duplicateLinesDown());
        } else if (event.altKey) {
          await this.historyService.runAtomic(host, () => this.editService.shiftLinesDown());
        } else if (event.shiftKey) {
          this.caretService.selectDown(host);
        } else {
          this.caretService.moveDown(host);
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (event.shiftKey && event.altKey) {
          await this.historyService.runAtomic(host, () => this.editService.duplicateLinesUp());
        } else if (event.altKey) {
          await this.historyService.runAtomic(host, () => this.editService.shiftLinesUp());
        } else if (event.shiftKey) {
          this.caretService.selectUp(host);
        } else {
          this.caretService.moveUp(host);
        }
        break;

      case "]":
      case "}":
      case "PageDown":
        event.preventDefault();
        if (event.shiftKey) {
          this.caretService.selectBlockEnd(host);
        } else {
          this.caretService.moveBlockEnd(host);
        }
        break;

      case "[":
      case "{":
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

      // Indent/Outdent
      case ".":
        if (event.altKey) {
          event.preventDefault();
          this.editService.shiftIndent(host, 1);
        }
        break;
      case ",":
        if (event.altKey) {
          event.preventDefault();
          this.editService.shiftIndent(host, -1);
        }
        break;

      // Inputs
      case "Delete":
        if (event.ctrlKey) {
          await this.historyService.runAtomic(host, () => this.editService.deleteWordAfter(host));
        } else {
          await this.historyService.runAtomic(host, () => this.editService.deleteAfter(host));
        }
        event.preventDefault();
        break;

      case "Backspace":
        if (event.ctrlKey) {
          await this.historyService.runAtomic(host, () => this.editService.deleteWordBefore(host));
        } else {
          await this.historyService.runAtomic(host, () => this.editService.deleteBefore(host));
        }
        event.preventDefault();
        break;

      case "Enter": // Enter
        this.handleEnterKeydown(event, host);
        break;
    }
  }

  private handleBeforeInputEvent(event: InputEvent, host: HTMLElement) {
    if (BLOCKED_INPUT_TYPES.includes(event.inputType)) {
      // currently, only handle plaintext input.
      // add more types in the future to support: italic, bold, underline, or composing input (CJK)
      event.preventDefault();
      return;
    }

    if (PASSTHROUGH_INPUT_TYPES.includes(event.inputType)) {
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
            const hiddenHyphens = LIST_CONTROL_CHAR.repeat(parseInt(lineCollapsed.dataset.listLevel!) - 1);

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

        event.preventDefault();
        return;
      }

      // enter when there is selection
      await this.historyService.runAtomic(host, () => this.editService.insertNewLine(host));
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
