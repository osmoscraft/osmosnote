import { query } from "./lib/query.js";
import { getNoteConfigFromUrl } from "./lib/route.js";
import { sourceToDom } from "./lib/source-to-dom.js";
import { cursorRight, cursorLeft, renderDefaultCursor } from "./lib/cursor.js";

async function loadNote() {
  const { id } = getNoteConfigFromUrl();

  if (id) {
    const { data, error } = await query(`/api/get-note`, { id });

    if (data?.note) {
      console.log(data.note);

      const dom = sourceToDom(data.note);

      document.querySelector("#content-host").appendChild(dom);
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
  const root = document.querySelector("#content-host");
  root.addEventListener("keydown", (event) => {
    console.log(event);

    switch (event.key) {
      case "ArrowLeft":
        cursorLeft(root);
        break;
      case "ArrowRight":
        cursorRight(root);
        break;
    }
  });
}
