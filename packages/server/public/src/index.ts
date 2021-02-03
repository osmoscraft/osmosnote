import { query } from "./lib/query.js";
import { getNoteConfigFromUrl } from "./lib/route.js";
import { sourceToLines } from "./lib/source-to-lines.js";
import type { GetNoteInput, GetNoteOutput } from "@system-two/server";
import { formatAll } from "./lib/format.js";
import { calculateMeasure, getMeasure, setMeasure } from "./lib/line-measure.js";
import { renderDefaultCursor, cursorLeft, cursorRight, cursorDown, cursorUp } from "./lib/curosr/cursor-select.js";

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
        event.preventDefault();
        cursorLeft(host);
        break;
      case "ArrowRight":
        event.preventDefault();
        cursorRight(host);
        break;
      case "ArrowDown":
        event.preventDefault();
        cursorDown(host);
        break;
      case "ArrowUp":
        event.preventDefault();
        cursorUp(host);
        break;
      // Inputs
      case "Enter": // Enter
        event.preventDefault();
    }
  });
}

function updateMeausre() {
  const measure = calculateMeasure(document.querySelector("#content-host") as HTMLElement);
  setMeasure(measure);

  console.log(getMeasure());
}

window.addEventListener("resize", updateMeausre);
updateMeausre();
