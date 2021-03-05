import type { CommandHandler } from "../command-bar.component.js";
import {
  renderHeaderRow,
  renderMessageRow,
  renderRecentNotesForInsert,
  renderSearchResultSectionForInsert,
} from "../menu/render-menu.js";
import { parseQuery } from "./parse-query.js";

export const handleInsertUrl: CommandHandler = async ({ input, context }) => {
  const query = input.args?.trim() ?? "";

  const { phrase, tags } = parseQuery(query);

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = renderHeaderRow("Create");

      if (!phrase) {
        optionsHtml += renderMessageRow("Paste a URL");

        try {
          const notes = await context.apiService.getRecentNotes();
          optionsHtml += renderRecentNotesForInsert(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error loading recent notes");
        }
      } else {
        const urlContentAsync = context.apiService.getContentFromUrl(phrase);
        const notesAsync = context.apiService.searchNotes(phrase, tags);

        try {
          const urlContent = await urlContentAsync;

          const searchParams = new URLSearchParams();
          searchParams.set("url", urlContent.canonicalUrl);
          searchParams.set("title", urlContent.title);
          searchParams.set("content", urlContent.description);
          const openUrl = `/?${searchParams}`;

          optionsHtml += /*html*/ `<s2-menu-row data-kind="option" data-insert-on-save="${openUrl}" data-label="${urlContent.title}"></s2-menu-row>`;
        } catch (error) {
          optionsHtml += renderMessageRow("Error visiting url");
        }

        try {
          const notes = await notesAsync;
          optionsHtml += renderSearchResultSectionForInsert(notes);
        } catch (error) {
          optionsHtml += renderMessageRow("Error searching notes");
        }
      }

      return optionsHtml;
    },
    // Cannot commit when there is no url
    runOnCommit: phrase
      ? () => {
          context.remoteHostService.insertNoteLinkAfterCreated(`/?url=${encodeURIComponent(phrase)}`);
        }
      : undefined,
  };
};
