export async function readClipboardText() {
  return navigator.clipboard.readText();
}

export function writeClipboardText(text: string) {
  return navigator.clipboard.writeText(text);
}
