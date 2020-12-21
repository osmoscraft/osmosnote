export interface UrlNoteConfig {
  filename: string | null;
  title: string | null;
  /**
   * the initial content for the note, in plaintext, not markdown.
   */
  content: string | null;
}

export function getNoteConfigFromUrl(): UrlNoteConfig {
  const url = new URL(location.href);
  const searchParams = new URLSearchParams(url.search);

  const rawTitle = searchParams.get("title")?.trim();
  const rawFilename = searchParams.get("filename")?.trim();
  const rawContent = searchParams.get("content")?.trim();

  // a parameter must have length
  const title = rawTitle?.length ? rawTitle : null;
  const filename = rawFilename?.length ? rawFilename : null;
  const content = rawContent?.length ? rawContent : null;

  return {
    title,
    filename,
    content,
  };
}
