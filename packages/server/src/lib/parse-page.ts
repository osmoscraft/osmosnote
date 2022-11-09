import type { CheerioAPI } from "cheerio";

export function getPageUrl($: CheerioAPI, fallbackUrl?: string) {
  let url = $(`link[rel="canonical"]`).attr("href")?.trim();

  if (!url) {
    url = fallbackUrl;
  }

  if (!url) {
    url = "";
  }

  return url;
}

const titlePatern = /<title>(.+)<\/title>/;

export function getPageTitle($: CheerioAPI) {
  let title = $(`meta[property="og:title"]`).attr("content")?.trim();

  if (!title) {
    title = $(`meta[name="twitter:title"]`).attr("content")?.trim();
  }

  if (!title) {
    title = $("title").text()?.trim();
  }

  if (!title) {
    title = $("h1").text()?.trim();
  }

  if (!title) {
    // edge case: cheerio cannot parse YouTube title
    title = titlePatern.exec($.html())?.[1];
  }

  if (!title) {
    title = "Untitled";
  }

  return title;
}

export function getPageDescription($: CheerioAPI) {
  let content = $(`meta[name="description"]`).attr("content")?.trim();

  if (!content) {
    content = $(`meta[property="og:description"]`).attr("content")?.trim();
  }

  if (!content) {
    content = "";
  }

  return content;
}
