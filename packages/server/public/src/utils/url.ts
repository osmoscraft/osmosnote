// ref: https://mathiasbynens.be/demo/url-regex
// @stephenhay
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/;

export function isUrl(input: string): boolean {
  return input.match(URL_PATTERN) !== null;
}

/**
 * If the input is URL, a lowercased version will be returned. Otherwise, null will be returned
 */
export function getLowerCaseUrl(input: string): string | null {
  return isUrl(input) ? input.toLowerCase() : null;
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
