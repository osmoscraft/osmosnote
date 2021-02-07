import type { GetNoteInput, GetNoteOutput } from "@system-two/server";
import { openNodeId, openUrl } from "./lib/curosr/cursor-action.js";
import { deleteAfter, deleteBefore, insertNewLine } from "./lib/curosr/cursor-edit.js";
import {
  cursorDown,
  cursorLeft,
  cursorRight,
  cursorSelectDown,
  cursorSelectLeft,
  cursorSelectRight,
  cursorSelectUp,
  cursorSelectWordEnd,
  cursorUp,
  cursorWordEnd,
  renderDefaultCursor,
} from "./lib/curosr/cursor-select.js";
import { formatAll } from "./lib/format.js";
import { calculateMeasure, getMeasure, setMeasure } from "./lib/line/line-measure.js";
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
          formatAll(host); // TODO use incremental formatting
          renderDefaultCursor(host); // TODO restore cursor
        }
        break;
      // Cursor movement
      case "ArrowLeft":
        if (!event.altKey) {
          event.preventDefault();
          if (event.shiftKey) {
            cursorSelectLeft(host);
          } else {
            cursorLeft(host);
          }
        }
        break;
      case "ArrowRight":
        if (!event.altKey) {
          event.preventDefault();
          if (event.ctrlKey && !event.shiftKey) {
            cursorWordEnd(host);
          } else if (event.ctrlKey && event.shiftKey) {
            cursorSelectWordEnd(host);
          } else if (!event.ctrlKey && event.shiftKey) {
            cursorSelectRight(host);
          } else if (!event.ctrlKey && !event.shiftKey) {
            cursorRight(host);
          }
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (event.shiftKey) {
          cursorSelectDown(host);
        } else {
          cursorDown(host);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (event.shiftKey) {
          cursorSelectUp(host);
        } else {
          cursorUp(host);
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
          insertNewLine(host);
          event.preventDefault();
          // insert new line at point
        }
    }
  });
}

function updateMeausre() {
  const measure = calculateMeasure(document.querySelector("#content-host") as HTMLElement);
  setMeasure(measure);
}

window.addEventListener("resize", updateMeausre);
updateMeausre();
