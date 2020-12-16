export function sendToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}
