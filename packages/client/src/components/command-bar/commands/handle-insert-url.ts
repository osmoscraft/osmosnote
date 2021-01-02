import type { CrawlBody, CrawlReply } from "@system-two/server/src/routes/crawl";
import type { NoteListReply } from "@system-two/server/src/routes/note-list";
import type { SearchBody, SearchReply } from "@system-two/server/src/routes/search";
import type { CommandHandler } from ".";
import {
  renderHeaderRow,
  renderMessageRow,
  renderRecentNotesForInsert,
  renderSearchResultSectionForInsert,
} from "../menu/render-menu";

export const handleInsertUrl: CommandHandler = async ({ input, context }) => {
  const url = input.args?.trim();

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = renderHeaderRow("Create");

      if (!url) {
        optionsHtml += renderMessageRow("Paste a URL");

        const result = await context.proxyService.get<NoteListReply>(`/api/notes`);
        optionsHtml += renderRecentNotesForInsert(result);

        return optionsHtml;
      }

      const searchAsync = await context.proxyService.post<SearchReply, SearchBody>(`/api/search`, {
        phrase: url,
      });

      const crawlAsync = await context.proxyService.post<CrawlReply, CrawlBody>(`/api/crawl`, {
        url,
      });

      const [searchResult, crawlResult] = await Promise.all([searchAsync, crawlAsync]);

      if (crawlResult.error || !crawlResult.data) {
        optionsHtml += /*html*/ renderMessageRow(crawlResult.error?.toString?.() ?? "Error crawling URL");
      } else {
        const searchParams = new URLSearchParams();
        searchParams.set("url", crawlResult.data.canonicalUrl);
        searchParams.set("title", crawlResult.data.title);
        searchParams.set("content", crawlResult.data.description);
        const openUrl = `/?${searchParams}`;

        optionsHtml += /*html*/ `<s2-menu-row data-kind="option" data-insert-on-save="${openUrl}" data-label="${crawlResult.data.title}"></s2-menu-row>`;
      }

      optionsHtml += renderSearchResultSectionForInsert(searchResult);

      return optionsHtml;
    },
    // Cannot commit when there is no url
    runOnCommit: url ? () => url && window.open(`/?url=${encodeURIComponent(url)}`, `_blank`) : undefined,
  };
};
