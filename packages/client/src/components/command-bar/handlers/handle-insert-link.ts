import type { CommandHandler } from ".";
import type { CrawlBody, CrawlReply } from "@system-two/server/src/routes/crawl";
import type { SearchBody, SearchReply } from "@system-two/server/src/routes/search";
import { getHeaderRow, getMessageRow } from "../shared/dropdown";
import { filenameToId } from "../../../utils/id";

export const handleInsertLink: CommandHandler = async ({ input, context }) => {
  const url = input.args;

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = "";

      optionsHtml += getHeaderRow("Create");

      if (!url) {
        optionsHtml += getMessageRow("Paste a URL");

        return optionsHtml;
      }

      const searchAsync = await context.proxyService.post<SearchReply, SearchBody>(`/api/search`, {
        phrase: url,
      });

      const crawlAsync = await context.proxyService.post<CrawlReply, CrawlBody>(`/api/crawl`, {
        url,
      });

      const [searchResult, crawlResult] = await Promise.all([searchAsync, crawlAsync]);

      // Menu order
      // crawl error | crawl result
      // search error | search error

      if (crawlResult.error || !crawlResult.data) {
        optionsHtml += /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--message">${
          crawlResult.error ?? "Error crawling URL"
        }</div>`;
      } else {
        const searchParams = new URLSearchParams();
        searchParams.set("url", crawlResult.data.canonicalUrl);
        searchParams.set("title", crawlResult.data.title);
        searchParams.set("content", crawlResult.data.description);
        const openUrl = `/?${searchParams}`;

        optionsHtml += /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-open-url="${openUrl}" data-always-new-tab="true" >${crawlResult.data.title}</div>`;
      }

      if (!searchResult?.items) {
        optionsHtml += /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--message">${"Error searching"}</div>`;
      } else {
        optionsHtml += getHeaderRow("Search results");
        optionsHtml += searchResult.items
          .map(
            (item) => /*html*/ `
        <div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-insert-text="[${
          item.title
        }](${filenameToId(item.filename)})">${item.title}</div>`
          )
          .join("");

        if (!searchResult.items.length) {
          optionsHtml += getMessageRow("No existing items");
        }
      }

      return optionsHtml;
    },
    runOnCommit: () => url && window.open(`/?url=${encodeURIComponent(url)}`, `_blank`),
  };
};
