export interface UrlNoteConfig {
  id: string | null;
  title: string | null;
  /**
   * the initial content for the note, in plaintext, not markdown.
   */
  content: string | null;
  url: string | null;
}

export class RouteService {
  getNoteConfigFromUrl(): UrlNoteConfig {
    const url = new URL(location.href);
    const searchParams = new URLSearchParams(url.search);

    const rawTitle = searchParams.get("title")?.trim();
    const rawId = searchParams.get("id")?.trim();
    const rawContent = searchParams.get("content")?.trim();
    const rawUrl = searchParams.get("url")?.trim();

    // a parameter must have length
    const title = rawTitle ? rawTitle : null;
    const id = rawId ? rawId : null;
    const content = rawContent ? rawContent : null;
    const metadataUrl = rawUrl ? rawUrl : null;

    return {
      title,
      id,
      content,
      url: metadataUrl,
    };
  }
}