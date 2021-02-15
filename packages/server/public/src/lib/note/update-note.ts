import type { UpdateNoteInput, UpdateNoteOutput } from "@system-two/server";
import { getPortableText } from "../line/line-query.js";
import { query } from "../query.js";
import { getNoteConfigFromUrl } from "../route.js";

export async function updateNote() {
  const { id } = getNoteConfigFromUrl();

  try {
    if (id) {
      const host = document.querySelector("#content-host") as HTMLElement;
      const lines = [...host.querySelectorAll("[data-line]")] as HTMLElement[];
      const note = getPortableText(lines);

      const { data, error } = await query<UpdateNoteOutput, UpdateNoteInput>(`/api/update-note`, { id, note });
      if (error) throw error;

      console.log("[note] saved");
    }
  } catch (error) {
    console.error(error);
  }
}
