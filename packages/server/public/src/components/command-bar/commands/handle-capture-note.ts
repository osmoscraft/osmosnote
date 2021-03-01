import { ensureNoteTitle } from "../../../utils/ensure-note-title.js";
import type { CommandHandler } from "../command-bar.component.js";
import {
  renderHeaderRow,
  renderMessageRow,
  renderRecentNotesForOpen,
  renderSearchResultSectionForOpen,
} from "../menu/render-menu.js";
import { parseQuery } from "./parse-query.js";

export const handleCaptureNote: CommandHandler = async ({ input, context }) => {
  const query = input.args?.trim() ?? "";

  const { phrase, tags } = parseQuery(query);

  const searchParams = new URLSearchParams();
  const newNoteTitle = ensureNoteTitle(phrase);
  searchParams.set("title", newNoteTitle);
  const newNoteUrl = newNoteTitle ? `/?${searchParams}` : "/";

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = renderHeaderRow("Create");

      optionsHtml += /*html*/ `<s2-menu-row data-kind="option" data-open-url="${newNoteUrl}" data-label="${newNoteTitle}"></s2-menu-row>`;

      if (!phrase?.length && !tags.length) {
        try {
          const notes = await context.apiService.getRecentNotes();
          optionsHtml += renderRecentNotesForOpen(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error loading recent notes");
        }
      } else {
        try {
          const notes = await context.apiService.searchNotes(phrase, tags);
          optionsHtml += renderSearchResultSectionForOpen(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error searching notes");
        }
      }

      return optionsHtml;
    },
    runOnCommit: () => {
      // treating input as title to create a new note
      window.open(newNoteUrl);
    },
  };
};
