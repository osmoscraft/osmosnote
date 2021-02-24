import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import type { HistoryService } from "../../services/history/history.service.js";
import type { ApiService } from "../../services/api/api.service.js";
import type { NotificationService } from "../../services/notification/notification.service.js";
import type { RouteService } from "../../services/route/route.service.js";
import { openNodeId, openUrl } from "./helpers/curosr/cursor-action.js";
import {
  cursorCopy,
  cursorCut,
  cursorPaste,
  deleteWordAfter,
  deleteAfter,
  deleteWordBefore,
  deleteBefore,
  insertNewLine,
  insertText,
} from "./helpers/curosr/cursor-edit.js";
import {
  cursorDocumentSelect,
  cursorLeft,
  cursorLeftSelect,
  cursorWordStart,
  cursorWordStartSelect,
  cursorRight,
  cursorRightSelect,
  cursorWordEnd,
  cursorWordEndSelect,
  cursorHome,
  cursorHomeSelect,
  cursorEnd,
  cursorEndSelect,
  cursorDownSelect,
  cursorDown,
  cursorUpSelect,
  cursorUp,
  cursorBlockEndSelect,
  cursorBlockEnd,
  cursorBlockStartSelect,
  cursorBlockStart,
} from "./helpers/curosr/cursor-select.js";
import { parseDocument } from "./helpers/parse.js";
import { getPortableText } from "./helpers/line/line-query.js";

export class InputService {
  constructor(
    private historyService: HistoryService,
    private noteService: ApiService,
    private routeService: RouteService,
    private notificationService: NotificationService,
    private componentRefService: ComponentRefService
  ) {}

  handleEvents() {
    const host = document.querySelector("#content-host") as HTMLElement;

    host.addEventListener("copy", (event) => {
      event.preventDefault();
      cursorCopy();
    });

    host.addEventListener("cut", (event) => {
      event.preventDefault();
      cursorCut(host);
      this.historyService.save(host);
    });

    host.addEventListener("paste", (event) => {
      event.preventDefault();

      const pasteText = event.clipboardData?.getData("text");
      cursorPaste(pasteText, host);
      this.historyService.save(host);
    });

    host.addEventListener("keydown", async (event) => {
      switch (event.key) {
        // undo/redo
        case "z":
          if (event.ctrlKey && !event.shiftKey) {
            this.historyService.undo(host);
            event.preventDefault();
          }
          break;

        case "Z":
          if (event.ctrlKey && event.shiftKey) {
            this.historyService.redo(host);
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
            cursorDocumentSelect(host);
          }
          break;

        // cut empty line
        case "x":
          if (event.ctrlKey) {
            event.preventDefault();
            cursorCut(host);
            this.historyService.save(host);
          }
          break;

        // Global shortcuts
        case "s": // save
          if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            parseDocument(host);
            const lines = [...host.querySelectorAll("[data-line]")] as HTMLElement[];
            const note = getPortableText(lines);
            // TODO ensure any required metadata fields, e.g. title and ctime

            const { id } = this.routeService.getNoteConfigFromUrl();
            try {
              if (id) {
                this.noteService.updateNote(id, note);
                this.historyService.save(host);
                this.notificationService.displayMessage("Saved");
              } else {
                const result = await this.noteService.createNote(note);
                location.href = `/?id=${result.id}`;
              }
            } catch (error) {
              this.notificationService.displayMessage("Error saving note");
            }
          }
          break;

        // Cursor movement
        case "ArrowLeft":
          if (event.altKey) break;

          event.preventDefault();
          if (!event.ctrlKey && !event.shiftKey) {
            cursorLeft(host);
          } else if (!event.ctrlKey && event.shiftKey) {
            cursorLeftSelect(host);
          } else if (event.ctrlKey && !event.shiftKey) {
            cursorWordStart(host);
          } else if (event.ctrlKey && event.shiftKey) {
            cursorWordStartSelect(host);
          }
          break;

        case "ArrowRight":
          if (event.altKey) break;

          event.preventDefault();
          if (!event.ctrlKey && !event.shiftKey) {
            cursorRight(host);
          } else if (!event.ctrlKey && event.shiftKey) {
            cursorRightSelect(host);
          } else if (event.ctrlKey && !event.shiftKey) {
            cursorWordEnd(host);
          } else if (event.ctrlKey && event.shiftKey) {
            cursorWordEndSelect(host);
          }
          break;

        case "Home":
          event.preventDefault();
          if (!event.shiftKey) {
            cursorHome(host);
          } else if (event.shiftKey) {
            cursorHomeSelect(host);
          }
          break;

        case "End":
          event.preventDefault();
          if (!event.shiftKey) {
            cursorEnd(host);
          } else if (event.shiftKey) {
            cursorEndSelect(host);
          }
          break;

        case "ArrowDown":
          event.preventDefault();
          if (event.shiftKey) {
            cursorDownSelect(host);
          } else {
            cursorDown(host);
          }
          break;

        case "ArrowUp":
          event.preventDefault();
          if (event.shiftKey) {
            cursorUpSelect(host);
          } else {
            cursorUp(host);
          }
          break;

        case "PageDown":
          event.preventDefault();
          if (event.shiftKey) {
            cursorBlockEndSelect(host);
          } else {
            cursorBlockEnd(host);
          }
          break;

        case "PageUp":
          event.preventDefault();
          if (event.shiftKey) {
            cursorBlockStartSelect(host);
          } else {
            cursorBlockStart(host);
          }
          break;

        // Inputs
        case "Delete":
          if (event.ctrlKey) {
            deleteWordAfter(host);
            this.historyService.save(host);
          } else {
            deleteAfter(host);
            this.historyService.save(host);
          }
          event.preventDefault();
          break;

        case "Backspace":
          if (event.ctrlKey) {
            deleteWordBefore(host);
            this.historyService.save(host);
          } else {
            deleteBefore(host);
            this.historyService.save(host);
          }
          event.preventDefault();
          break;

        case "Enter": // Enter
          const collapsedCursorParents = [
            ...host.querySelectorAll(`[data-cursor-collapsed]`),
          ].reverse() as HTMLElement[];
          for (let container of collapsedCursorParents) {
            if (container.dataset.noteId) {
              // open internal id link
              openNodeId(container.dataset.noteId, event);
              event.preventDefault();
              break;
            } else if (container.dataset.url) {
              // open external url
              openUrl(container.dataset.url, event);
              event.preventDefault();
              break;
            }
          }

          if (!event.defaultPrevented) {
            // insert new line at point
            insertNewLine(host);
            this.historyService.save(host);
            event.preventDefault();
          }
          break;
      }
    });

    host.addEventListener("beforeinput", (event) => {
      const insertedText = (event as InputEvent).data;
      if (insertedText) {
        event.preventDefault();
        insertText(insertedText, host);

        if (insertedText.match(/\s|,|\./)) {
          this.historyService.save(host);
        }
      }
    });
  }
}
