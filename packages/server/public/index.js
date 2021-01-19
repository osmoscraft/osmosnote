import { query } from "./lib/query.js";
import { getNoteConfigFromUrl } from "./lib/route.js";
import { sourceToDom } from "./lib/source-to-dom.js";

async function loadNote() {

  const { id } = getNoteConfigFromUrl();

  if (id) {
    const { data, error } = await query(`/api/get-note`, { id });

    if (data?.note) {
      console.log(data.note);

      const dom = sourceToDom(data.note);

      document.querySelector("#content-host").appendChild(dom);
    }

    if (error) {
      console.error(error);
    }
  }
}

loadNote();
