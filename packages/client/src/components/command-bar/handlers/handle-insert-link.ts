import type { CommandHandler } from ".";
import type { CrawlBody, CrawlReply } from "@system-two/server/src/routes/crawl";

export const handleInsertLink: CommandHandler = async ({ input, context }) => {
  const url = input.args;

  return {
    onInputChange: async () => {
      let optionsHtml = /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--header">Insert link</div>`;

      if (!url) return optionsHtml;

      const crawlResult = await context.proxyService.post<CrawlReply, CrawlBody>(`/api/crawl`, {
        url,
      });

      if (crawlResult.error || !crawlResult.data) {
        return (
          /*html*/ optionsHtml +
          `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--message">${crawlResult.error ?? "No result"}</div>`
        );
      } else {
        const searchParams = new URLSearchParams();
        searchParams.set("url", crawlResult.data.canonicalUrl);
        searchParams.set("title", crawlResult.data.title);
        searchParams.set("content", crawlResult.data.description);
        const openUrl = `/?${searchParams}`;

        return (
          /*html*/ optionsHtml +
          `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option  data-open-url="${openUrl}" data-always-new-tab="true" >${crawlResult.data.title}</div>`
        );
      }
    },
    onExecute: () => url && window.open(`/?url=${encodeURIComponent(url)}`, `_blank`),
  };
};
