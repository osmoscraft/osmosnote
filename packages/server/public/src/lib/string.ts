export function removeLineEnding(text: string): string {
  if (text[text.length - 1] === "\n") {
    return text.slice(0, -1);
  } else {
    return text;
  }
}
