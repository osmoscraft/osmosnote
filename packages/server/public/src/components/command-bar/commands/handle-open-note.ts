import { ensureNoteTitle } from "../../../utils/ensure-note-title.js";
import { getLowerCaseUrl, getUrlWithSearchParams } from "../../../utils/url.js";
import type { CommandHandler } from "../command-bar.component.js";
import { PayloadAction } from "../menu/menu-row.component.js";
import {
  renderCrawlResult,
  renderHeaderRow,
  renderMessageRow,
  renderNoteWithUrl,
  renderRecentNotes,
  renderSearchResultSection,
} from "../menu/render-menu.js";
import { parseQuery } from "./parse-query.js";

export const handleOpenOrCreateNote: CommandHandler = async ({ input, context }) => {
  const query = input.args?.trim() ?? "";

  const { phrase, tags } = parseQuery(query);
  const targetUrl = getLowerCaseUrl(phrase);

  const newNoteTitle = ensureNoteTitle(phrase);

  const newNoteUrl = getUrlWithSearchParams("/", {
    url: targetUrl,
    title: newNoteTitle,
  });

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = "";

      if (!phrase?.length && !tags.length) {
        optionsHtml += renderMessageRow("Type keywords or URL");

        // Blank input, show recent notes
        try {
          const notes = await context.apiService.getRecentNotes();
          optionsHtml += renderRecentNotes("Open recent", notes, PayloadAction.openNoteById);
        } catch (error) {
          optionsHtml += renderMessageRow("Error loading recent notes");
        }
      } else {
        optionsHtml = renderHeaderRow("Open new");

        // Start search first for parallelism
        const notesAsync = context.apiService.searchNotes(phrase, tags);

        // URL crawl result
        if (targetUrl) {
          try {
            const urlContent = await context.apiService.getContentFromUrl(targetUrl);
            optionsHtml += renderCrawlResult(urlContent, PayloadAction.openNoteByUrl);
          } catch (error) {
            console.error(error);
            optionsHtml += renderMessageRow("Error visiting URL");
          }
        }

        // Raw new note
        optionsHtml += renderNoteWithUrl(newNoteUrl, newNoteTitle, PayloadAction.openNoteByUrl);

        // Search result
        try {
          const notes = await notesAsync;
          optionsHtml += renderSearchResultSection("Open search result", notes, PayloadAction.openNoteById);
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
