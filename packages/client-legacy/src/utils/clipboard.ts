export function sendToClipboard(text: string): boolean {
  navigator.clipboard.writeText(text);
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.log("clipboard permission denied");
    return false;
  }
}
