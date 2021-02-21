import type { SearchNoteInput, SearchNoteOutput } from "@system-two/server";
import type { CommandHandler } from "../command-bar.component.js";
import { renderHeaderRow, renderMessageRow, renderSearchResultSectionForOpen } from "../menu/render-menu.js";
import { getDefaultTitle } from "../../../utils/get-default-title.js";

export const handleCaptureNote: CommandHandler = async ({ input, context }) => {
  const phrase = input.args?.trim();

  const searchParams = new URLSearchParams();
  phrase && searchParams.set("title", phrase);
  const openUrl = phrase ? `/?${searchParams}` : "/";

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = renderHeaderRow("Create");

      optionsHtml += /*html*/ `<s2-menu-row data-kind="option" data-open-url="${openUrl}" data-label="${getDefaultTitle(
        phrase
      )}"></s2-menu-row>`;

      if (!phrase?.length) {
        optionsHtml += renderMessageRow("Type to search");

        return optionsHtml;
      }

      const result = await context.proxyService.query<SearchNoteOutput, SearchNoteInput>(`/api/search-note`, {
        phrase,
      });

      if (result.data) {
        optionsHtml += renderSearchResultSectionForOpen(result.data);

        return optionsHtml;
      } else {
        optionsHtml += renderMessageRow("Something went wrong");
        return optionsHtml;
      }
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
