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
  const selectedText = context.componentRefs.textEditor.getSelectedText();

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
      let optionsHtml = renderHeaderRow("Link to");

      if (!phrase?.length && !tags.length) {
        optionsHtml += renderMessageRow("Type keywords or URL");

        // Blank input, show recent notes
        try {
          const notes = await context.apiService.getRecentNotes();
          optionsHtml += renderRecentNotes(notes, PayloadAction.linkToNoteById);
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
          optionsHtml += renderSearchResultSection(notes, PayloadAction.linkToNoteById);
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
