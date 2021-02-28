import { getDefaultTitle } from "../../../utils/get-default-title.js";
import type { CommandHandler } from "../command-bar.component.js";
import {
  renderHeaderRow,
  renderMessageRow,
  renderRecentNotesForInsert,
  renderSearchResultSectionForInsert,
} from "../menu/render-menu.js";
import { parseQuery } from "./parse-query.js";

export const handleInsertNote: CommandHandler = async ({ input, context }) => {
  const query = input.args?.trim() ?? "";

  const { phrase, tags } = parseQuery(query);

  const searchParams = new URLSearchParams();
  phrase && searchParams.set("title", phrase);
  const openUrl = phrase ? `/?${searchParams}` : "/";

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = renderHeaderRow("Create");

      optionsHtml += /*html*/ `<s2-menu-row data-kind="option" data-insert-on-save="${openUrl}" data-label="${getDefaultTitle(
        phrase
      )}"></s2-menu-row>`;

      if (!phrase?.length && !tags.length) {
        try {
          const notes = await context.apiService.listNotes();
          optionsHtml += renderRecentNotesForInsert(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error loading recent notes");
        }
      } else {
        try {
          const notes = await context.apiService.searchNotes(phrase, tags);
          optionsHtml += renderSearchResultSectionForInsert(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error searching notes");
        }
      }

      return optionsHtml;
    },
    runOnCommit: () => {
      // treating input as title to create a new note
      if (phrase?.length) {
        context.remoteHostService.insertNoteLinkAfterCreated(`/?title=${phrase}`);
      } else {
        context.remoteHostService.insertNoteLinkAfterCreated(`/`);
      }
    },
  };
};
