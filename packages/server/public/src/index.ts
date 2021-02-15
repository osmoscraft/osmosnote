import { handleEvents } from "./lib/input/handle-events.js";
import { calculateMeasure, setMeasure } from "./lib/line/line-measure.js";
import { loadNote } from "./lib/note/load-note.js";

loadNote().then(() => {
  handleEvents();
});

function updateMeausre() {
  const measure = calculateMeasure(document.querySelector("#content-host") as HTMLElement);
  setMeasure(measure);
}

window.addEventListener("resize", updateMeausre);
updateMeausre();
