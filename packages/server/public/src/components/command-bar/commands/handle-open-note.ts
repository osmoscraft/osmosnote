import { ensureNoteTitle } from "../../../utils/ensure-note-title.js";
import { getLowerCaseUrl } from "../../../utils/url.js";
import type { CommandHandler } from "../command-bar.component.js";
import {
  renderCrawlResultForOpen,
  renderHeaderRow,
  renderMessageRow,
  renderRecentNotesForOpen,
  renderSearchResultSectionForOpen,
} from "../menu/render-menu.js";
import { parseQuery } from "./parse-query.js";

export const handleOpenOrCreateNote: CommandHandler = async ({ input, context }) => {
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
      let optionsHtml = renderHeaderRow("Open new");

      optionsHtml += /*html*/ `<s2-menu-row data-kind="option" data-open-url="${newNoteUrl}" data-label="${newNoteTitle}"></s2-menu-row>`;

      if (!phrase?.length && !tags.length) {
        // Blank input, show recent notes
        try {
          const notes = await context.apiService.getRecentNotes();
          optionsHtml += renderRecentNotesForOpen(notes);
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
            optionsHtml += renderCrawlResultForOpen(urlContent);
          } catch (error) {
            console.error(error);
            optionsHtml += renderMessageRow("Error visiting URL");
          }
        }

        // Search result
        try {
          const notes = await notesAsync;
          optionsHtml += renderSearchResultSectionForOpen(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error searching notes");
        }
      }

      return optionsHtml;
    },
    runOnCommit: () => {
      // treating input as title to create a new note
      context.windowRef.window.open(newNoteUrl, "_self");
    },
  };
};
