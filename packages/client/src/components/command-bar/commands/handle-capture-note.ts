import type { NoteListReply } from "@system-two/server/src/routes/note-list";
import type { SearchBody, SearchReply } from "@system-two/server/src/routes/search";
import type { CommandHandler } from ".";
import { ensureNoteTitle } from "../../../utils/get-default-title";
import { renderHeaderRow, renderRecentNotesForOpen, renderSearchResultSectionForOpen } from "../menu/render-menu";

export const handleCaptureNote: CommandHandler = async ({ input, context }) => {
  const phrase = input.args?.trim();

  const searchParams = new URLSearchParams();
  phrase && searchParams.set("title", phrase);
  const openUrl = phrase ? `/?${searchParams}` : "/";

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = renderHeaderRow("Create");

      optionsHtml += /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-open-url="${openUrl}">${ensureNoteTitle(
        phrase
      )}</div>`;

      if (!phrase?.length) {
        const result = await context.proxyService.get<NoteListReply>(`/api/notes`);

        optionsHtml += renderRecentNotesForOpen(result);

        return optionsHtml;
      }

      const result = await context.proxyService.post<SearchReply, SearchBody>(`/api/search`, {
        phrase,
      });

      optionsHtml += renderSearchResultSectionForOpen(result);

      return optionsHtml;
    },
    runOnCommit: () => {
      // treating input as title to create a new note
      if (phrase?.length) {
        window.open(`/?title=${phrase}`, `_self`);
      } else {
        window.open(`/`, `_self`);
      }
    },
  };
};
