/**
 * Format `[ctrl+][alt+][shift+]<key>`
 * @example
 * // ctrl+k
 * // ctrl+shift+space
 * // alt+`
 */
export function getCombo(e: KeyboardEvent): string {
  return `${e.ctrlKey ? "ctrl+" : ""}${e.altKey ? "alt+" : ""}${e.shiftKey ? "shift+" : ""}${normalizeKey(e.key)}`;
}

function normalizeKey(key: string) {
  switch (key) {
    case " ":
      return "space";
    default:
      return `${key.slice(0, 1).toLowerCase()}${key.slice(1)}`;
  }
}
