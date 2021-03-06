import { ensureNoteTitle } from "../../../utils/ensure-note-title.js";
import { getLowerCaseUrl } from "../../../utils/url.js";
import type { CommandHandler } from "../command-bar.component.js";
import {
  renderCrawlResultForInsert,
  renderHeaderRow,
  renderMessageRow,
  renderRecentNotesForInsert,
  renderSearchResultSectionForInsert,
} from "../menu/render-menu.js";
import { parseQuery } from "./parse-query.js";

export const handleInsertNote: CommandHandler = async ({ input, context }) => {
  const query = input.args?.trim() ?? "";

  const { phrase, tags } = parseQuery(query);
  const url = getLowerCaseUrl(phrase);

  const searchParams = new URLSearchParams();
  const newNoteTitle = ensureNoteTitle(phrase);
  if (url) {
    searchParams.set("url", url);
  } else {
    searchParams.set("title", newNoteTitle);
  }
  const newNoteUrl = `/?${searchParams}`;

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = renderHeaderRow("Insert new");

      optionsHtml += /*html*/ `<s2-menu-row data-kind="option" data-insert-on-save="${newNoteUrl}" data-label="${newNoteTitle}"></s2-menu-row>`;

      if (!phrase?.length && !tags.length) {
        // Blank input, show recent notes
        try {
          const notes = await context.apiService.getRecentNotes();
          optionsHtml += renderRecentNotesForInsert(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error loading recent notes");
        }
      } else {
        // Start search first for parallelism
        const notesAsync = context.apiService.searchNotes(phrase, tags);

        // URL crawl result
        if (url) {
          try {
            const urlContent = await context.apiService.getContentFromUrl(url);
            optionsHtml += renderCrawlResultForInsert(urlContent);
          } catch (error) {
            console.error(error);
            optionsHtml += renderMessageRow("Error visiting URL");
          }
        }

        // Search result
        try {
          const notes = await notesAsync;
          optionsHtml += renderSearchResultSectionForInsert(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error searching notes");
        }
      }

      return optionsHtml;
    },
    runOnCommit: () => {
      // treating input as title to create a new note
      context.remoteHostService.insertNoteLinkAfterCreated(newNoteUrl);
    },
  };
};
