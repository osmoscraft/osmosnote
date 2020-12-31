export interface UrlNoteConfig {
  filename: string | null;
  title: string | null;
  /**
   * the initial content for the note, in plaintext, not markdown.
   */
  content: string | null;
  url: string | null;
}

export function getNoteConfigFromUrl(): UrlNoteConfig {
  const url = new URL(location.href);
  const searchParams = new URLSearchParams(url.search);

  const rawTitle = searchParams.get("title")?.trim();
  const rawFilename = searchParams.get("filename")?.trim();
  const rawContent = searchParams.get("content")?.trim();
  const rawUrl = searchParams.get("url")?.trim();

  // a parameter must have length
  const title = rawTitle ? rawTitle : null;
  const filename = rawFilename ? rawFilename : null;
  const content = rawContent ? rawContent : null;
  const metadataUrl = rawUrl ? rawUrl : null;

  return {
    title,
    filename,
    content,
    url: metadataUrl,
  };
}
