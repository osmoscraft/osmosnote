import axios from "axios";
import cheerio from "cheerio";
import type { RouteHandlerMethod } from "fastify";
import { getPageDescription, getPageTitle, getPageUrl } from "../lib/parse-page";

export interface HandleCrawl {
  Body: CrawlBody;
  Reply: CrawlReply;
}

export interface CrawlBody {
  url: string;
}

export type CrawlReply = {
  error?: string;
  data?: {
    title: string;
    description: string;
    canonicalUrl: string;
  };
};

export const handleCrawl: RouteHandlerMethod<any, any, any, HandleCrawl> = async (request, reply) => {
  const url = request.body.url;

  if (!url)
    return {
      error: "Cannot crawl an empty URL",
    };

  try {
    const response = await axios.get(url);

    if (response.status !== 200) {
      return {
        error: `Fetch status (${response.status}) is not OK`,
      };
    }

    const $ = cheerio.load(response.data);

    return {
      data: {
        title: getPageTitle($),
        description: getPageDescription($),
        canonicalUrl: getPageUrl($, url),
      },
    };
  } catch {
    return {
      error: `Error fetching URL: ${url}`,
    };
  }
};
