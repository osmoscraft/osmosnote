import type { NoteListReply } from "@system-two/server/src/routes/note-list";
import type { SearchResult } from "@system-two/server/src/routes/search";
import type { CommandHandler } from ".";
import { filenameToId } from "../../../utils/id";

export const handleOpenNote: CommandHandler = async ({ input }) => {
  const phrase = input.args;

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--header">Open note</div>`;

      if (phrase?.length) {
        const params = new URLSearchParams({
          phrase,
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        const result: SearchResult = await response.json();

        optionsHtml += result.items
          .map(
            (item) => /*html*/ `
            <div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-open-note-by-id="${filenameToId(
              item.filename
            )}">${item.title}</div>`
          )
          .join("");
      } else {
        // load recent notes
        const response = await fetch(`/api/notes`);
        const result: NoteListReply = await response.json();
        optionsHtml += result.notes
          .map(
            (item) =>
              /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-open-note-by-id="${filenameToId(
                item.filename
              )}">${item.title}</div>`
          )
          .join("");
      }

      return optionsHtml;
    },
    runOnCommit: () => {
      // treating input as title to create a new note

      const title = input.args?.trim();
      if (title?.length) {
        window.open(`/?title=${title}`, `_self`);
      } else {
        window.open(`/`, `_self`);
      }
    },
  };
};
