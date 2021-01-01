import type cheerio from "cheerio";
type CheerioRoot = ReturnType<typeof cheerio["load"]>;

export function getPageUrl($: CheerioRoot, fallbackUrl?: string) {
  let url = $(`link[rel="canonical"]`).attr("href")?.trim();

  if (!url) {
    url = fallbackUrl;
  }

  if (!url) {
    url = "";
  }

  return url;
}

export function getPageTitle($: CheerioRoot) {
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
    title = "";
  }

  return title;
}

export function getPageDescription($: CheerioRoot) {
  let content = $(`meta[name="description"]`).attr("content")?.trim();

  if (!content) {
    content = $(`meta[property="og:description"]`).attr("content")?.trim();
  }

  if (!content) {
    content = "";
  }

  return content;
}
