import { load } from "cheerio";
import { createHandler } from "../lib/create-handler";
import { getPageDescription, getPageTitle, getPageUrl } from "../lib/parse-page";

export interface GetContentFromUrlInput {
  url: string;
}

export interface GetContentFromUrlOutput {
  title: string;
  description: string;
  canonicalUrl: string;
}

export const handleGetContentFromUrl = createHandler<GetContentFromUrlOutput, GetContentFromUrlInput>(async (input) => {
  const url = input.url;

  if (!url) {
    throw new Error("Cannot crawl an empty URL");
  }

  try {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error(`Fetch status (${response.status}) is not OK`);
    }

    const $ = load(await response.text());

    return {
      title: getPageTitle($),
      description: getPageDescription($),
      canonicalUrl: getPageUrl($, url),
    };
  } catch (error) {
    console.error(`Error parsing ${url}`);
    throw error;
  }
});
