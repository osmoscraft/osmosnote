const searchParams = new URLSearchParams();
searchParams.set("url", getUrl());
searchParams.set("title", getTitle());
searchParams.set("content", getContent());
const captureUIrl = new URL("http://localhost:2077?" + searchParams.toString());

window.open(captureUIrl);

function getUrl() {
  let url = document.querySelector(`link[rel="canonical"]`)?.href.trim();

  if (!url) {
    url = location.href;
  }

  if (!url) {
    url = "https://";
  }

  return url;
}

function getTitle() {
  let title = document.querySelector(`meta[property="og:title"]`)?.content.trim();

  if (!title) {
    title = document.querySelector(`meta[name="twitter:title"]`)?.content.trim();
  }

  if (!title) {
    title = document.title.trim();
  }

  if (!title) {
    title = document.querySelector("h1")?.innerText.trim();
  }

  if (!title) {
    title = getUrl();
  }

  if (!title) {
    title = "";
  }

  return title;
}

function getContent() {
  let content = window.getSelection()?.trim?.().toString();

  if (!content) {
    content = document.querySelector(`meta[name="description"]`)?.content.trim();
  }

  if (!content) {
    content = document.querySelector(`meta[property="og:description"]`)?.content.trim();
  }

  if (!content) {
    content = "";
  }

  return content;
}
