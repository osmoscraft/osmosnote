import type { SearchNoteInput, SearchNoteOutput, ListNotesInput, ListNotesOutput } from "@system-two/server";
import type { CommandHandler } from "../command-bar.component.js";
import {
  renderHeaderRow,
  renderMessageRow,
  renderRecentNotesForOpen,
  renderSearchResultSectionForOpen,
} from "../menu/render-menu.js";
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
        try {
          const notes = await context.apiService.listNotes();
          optionsHtml += renderRecentNotesForOpen(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error loading recent notes");
        }
      } else {
        try {
          const notes = await context.apiService.searchNotes(phrase);
          optionsHtml += renderSearchResultSectionForOpen(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error searching notes");
        }
      }

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
