import type { NoteListReply } from "@system-two/server/src/routes/note-list";
import type { SearchBody, SearchReply } from "@system-two/server/src/routes/search";
import type { CommandHandler } from ".";
import { ensureNoteTitle } from "../../../utils/get-default-title";
import { renderHeaderRow, renderRecentNotesForInsert, renderSearchResultSectionForInsert } from "../menu/render-menu";

export const handleInsertNote: CommandHandler = async ({ input, context }) => {
  const phrase = input.args?.trim();

  const searchParams = new URLSearchParams();
  phrase && searchParams.set("title", phrase);
  const openUrl = phrase ? `/?${searchParams}` : "/";

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = renderHeaderRow("Create");

      optionsHtml += /*html*/ `<s2-menu-row data-kind="option" data-insert-on-save="${openUrl}" data-label="${ensureNoteTitle(
        phrase
      )}"></s2-menu-row>`;

      if (!phrase?.length) {
        const result = await context.proxyService.get<NoteListReply>(`/api/notes`);

        optionsHtml += renderRecentNotesForInsert(result);

        return optionsHtml;
      }

      const result = await context.proxyService.post<SearchReply, SearchBody>(`/api/search`, {
        phrase,
      });

      optionsHtml += renderSearchResultSectionForInsert(result);

      return optionsHtml;
    },
    runOnCommit: () => {
      // treating input as title to create a new note
      if (phrase?.length) {
        context.windowBridgeService.insertNoteLinkAfterCreated(`/?title=${phrase}`);
      } else {
        context.windowBridgeService.insertNoteLinkAfterCreated(`/`);
      }
    },
  };
};
