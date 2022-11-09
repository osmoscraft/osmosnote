// ref: https://mathiasbynens.be/demo/url-regex
// @stephenhay
export const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
export const URL_PATTERN_WITH_PREFIX = /^(.*?)(https?:\/\/[^\s/$.?#].[^\s]*)/;

export function isUrl(input: string): boolean {
  return input.match(URL_PATTERN) !== null;
}

/**
 * If the input is URL, return the URL. Otherwise, null will be returned
 */
export function findUrl(input: string): string | null {
  return isUrl(input) ? input : null;
}

export function getUrlWithSearchParams(path: string, parameters: Record<string, null | undefined | string>): string {
  const searchParams = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, value);
    }
  });

  const composedUrl = [...searchParams.keys()].length ? `${path}?${searchParams}` : path;

  return composedUrl;
}
