import { query } from "./lib/query.js";
import { getNoteConfigFromUrl } from "./lib/route.js";
import { sourceToDom } from "./lib/source-to-dom.js";
import { cursorRight, cursorLeft, renderDefaultCursor, cursorDown, cursorUp } from "./lib/cursor.js";
import type { GetNoteInput, GetNoteOutput } from "@system-two/server";
import { formatAll } from "./lib/format.js";

async function loadNote() {
  const { id } = getNoteConfigFromUrl();

  if (id) {
    const { data, error } = await query<GetNoteOutput, GetNoteInput>(`/api/get-note`, { id });

    if (data?.note) {
      const dom = sourceToDom(data.note);

      const host = document.querySelector("#content-host") as HTMLElement;

      host.appendChild(dom);
      formatAll(host);
      renderDefaultCursor();

      handleEvents();
    }

    if (error) {
      console.error(error);
    }
  }
}

loadNote();

function handleEvents() {
  const root = document.querySelector("#content-host") as HTMLElement;
  root.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        cursorLeft(root);
        break;
      case "ArrowRight":
        event.preventDefault();
        cursorRight(root);
        break;
      case "ArrowDown":
        event.preventDefault();
        cursorDown();
        break;
      case "ArrowUp":
        event.preventDefault();
        cursorUp();
        break;
    }
  });
}
