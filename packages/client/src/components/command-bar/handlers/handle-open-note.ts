import type { NoteListReply } from "@system-two/server/src/routes/note-list";
import type { SearchBody, SearchReply } from "@system-two/server/src/routes/search";
import type { CommandHandler } from ".";
import { ensureNoteTitle } from "../../../utils/get-default-title";
import { filenameToId } from "../../../utils/id";
import { getHeaderRow, getMessageRow } from "../shared/dropdown";

export const handleOpenNote: CommandHandler = async ({ input, context }) => {
  const phrase = input.args?.trim();

  const searchParams = new URLSearchParams();
  phrase && searchParams.set("title", phrase);
  const openUrl = phrase ? `/?${searchParams}` : "/";

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = getHeaderRow("Create");

      optionsHtml += /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-open-url="${openUrl}">${ensureNoteTitle(
        phrase
      )}</div>`;

      if (phrase?.length) {
        optionsHtml += getHeaderRow("Search results");

        const result = await context.proxyService.post<SearchReply, SearchBody>(`/api/search`, {
          phrase,
        });

        if (!result?.items) {
          optionsHtml += getMessageRow("Error searching");
        } else {
          optionsHtml += result.items
            .map(
              (item) => /*html*/ `
            <div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-open-note-by-id="${filenameToId(
              item.filename
            )}">${item.title}</div>`
            )
            .join("");

          if (!result.items.length) {
            optionsHtml += getMessageRow("No items found");
          }
        }
      } else {
        optionsHtml += getHeaderRow("Recent");

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

        if (!result.notes.length) {
          optionsHtml += getMessageRow("No recent items");
        }
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
