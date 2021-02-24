export interface UrlNoteConfig {
  id?: string;
  title?: string;
  /**
   * the initial content for the note, in plaintext, not markdown.
   */
  content?: string;
  url?: string;
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
    const title = rawTitle ? rawTitle : undefined;
    const id = rawId ? rawId : undefined;
    const content = rawContent ? rawContent : undefined;
    const metadataUrl = rawUrl ? rawUrl : undefined;

    return {
      title,
      id,
      content,
      url: metadataUrl,
    };
  }
}
