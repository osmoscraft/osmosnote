import { ensureNoteTitle } from "../../../utils/ensure-note-title.js";
import { getLowerCaseUrl } from "../../../utils/url.js";
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
import { handleInsertNote } from "./handle-insert-note.js";
import { parseQuery } from "./parse-query.js";

export const handleLinkToNote: CommandHandler = async ({ input, context }) => {
  const selectedText = context.componentRefs.textEditor.getSelectedText()?.trim();

  // Same behavior as insert when there is no selection
  if (!selectedText) return handleInsertNote({ input, context });

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
      let optionsHtml = "";

      if (!phrase?.length && !tags.length) {
        optionsHtml += renderMessageRow("Type keywords or URL");

        // kick off network requests in parallel
        const recentNotesAsync = context.apiService.getRecentNotes();
        const foundNotesAsync = context.apiService.searchNotes(selectedText);

        // Blank input, show recent notes AND search using selected text
        try {
          const recentNotes = await recentNotesAsync;
          optionsHtml += renderRecentNotes("Link to recent", recentNotes, PayloadAction.linkToNoteById);
        } catch (error) {
          optionsHtml += renderMessageRow("Error loading recent notes");
        }

        try {
          const foundNotes = await foundNotesAsync;
          optionsHtml += renderSearchResultSection("Link to search result", foundNotes, PayloadAction.linkToNoteById);
        } catch (error) {
          optionsHtml += renderMessageRow("Error searching notes");
        }
      } else {
        optionsHtml += renderHeaderRow("Link to new");

        // Start search first for parallelism
        const notesAsync = context.apiService.searchNotes(phrase, tags);

        // URL crawl result
        if (url) {
          try {
            const urlContent = await context.apiService.getContentFromUrl(url);
            optionsHtml += renderCrawlResult(urlContent, PayloadAction.linkToNewNoteByUrl);
          } catch (error) {
            console.error(error);
            optionsHtml += renderMessageRow("Error visiting URL");
          }
        }

        // Raw new note
        optionsHtml += renderNoteWithUrl(newNoteUrl, newNoteTitle, PayloadAction.linkToNewNoteByUrl);

        // Search result
        try {
          const notes = await notesAsync;
          optionsHtml += renderSearchResultSection("Link to search result", notes, PayloadAction.linkToNoteById);
        } catch (error) {
          optionsHtml += renderMessageRow("Error searching notes");
        }
      }

      return optionsHtml;
    },
    runOnCommit: () => {
      // treating input as title to create a new note
      context.componentRefs.textEditor.linkToNoteOnSave(newNoteUrl);
    },
  };
};
