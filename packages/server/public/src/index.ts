import type { GetNoteInput, GetNoteOutput } from "@system-two/server";
import { openNodeId, openUrl } from "./lib/curosr/cursor-action.js";
import { deleteAfter, deleteBefore, insertNewLine, insertText } from "./lib/curosr/cursor-edit.js";
import {
  cursorBlockEnd,
  cursorBlockEndSelect,
  cursorBlockStart,
  cursorBlockStartSelect,
  cursorDown,
  cursorDownSelect,
  cursorEnd,
  cursorEndSelect,
  cursorHome,
  cursorHomeSelect,
  cursorLeft,
  cursorLeftSelect,
  cursorRight,
  cursorRightSelect,
  cursorUp,
  cursorUpSelect,
  cursorWordEnd,
  cursorWordEndSelect,
  cursorWordStart,
  cursorWordStartSelect,
  renderDefaultCursor,
} from "./lib/curosr/cursor-select.js";
import { formatAll } from "./lib/format.js";
import { calculateMeasure, setMeasure } from "./lib/line/line-measure.js";
import { query } from "./lib/query.js";
import { getNoteConfigFromUrl } from "./lib/route.js";
import { sourceToLines } from "./lib/source-to-lines.js";

async function loadNote() {
  const { id } = getNoteConfigFromUrl();

  if (id) {
    const { data, error } = await query<GetNoteOutput, GetNoteInput>(`/api/get-note`, { id });

    if (data?.note) {
      const dom = sourceToLines(data.note);

      const host = document.querySelector("#content-host") as HTMLElement;

      host.appendChild(dom);
      formatAll(host);
      renderDefaultCursor(host);

      handleEvents();
    }

    if (error) {
      console.error(error);
    }
  }
}

loadNote();

function handleEvents() {
  const host = document.querySelector("#content-host") as HTMLElement;
  host.addEventListener("keydown", (event) => {
    switch (event.key) {
      // Global shortcuts
      case "s": // save
        if (event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          formatAll(host);
          renderDefaultCursor(host); // TODO restore cursor
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
        deleteAfter(host);
        event.preventDefault();
        break;
      case "Backspace":
        deleteBefore(host);
        event.preventDefault();
        break;
      case "Enter": // Enter
        // TODO improve efficiency
        const collapsedCursorParents = [...host.querySelectorAll(`[data-cursor-collapsed]`)].reverse() as HTMLElement[];
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
          event.preventDefault();
        }
    }
  });

  host.addEventListener("beforeinput", (event) => {
    const insertedText = (event as InputEvent).data;
    if (insertedText) {
      event.preventDefault();
      insertText(insertedText, host);
    }
  });
}

function updateMeausre() {
  const measure = calculateMeasure(document.querySelector("#content-host") as HTMLElement);
  setMeasure(measure);
}

window.addEventListener("resize", updateMeausre);
updateMeausre();
