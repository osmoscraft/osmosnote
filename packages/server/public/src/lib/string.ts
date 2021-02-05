export function removeLineEnding(text: string): string {
  if (text[text.length - 1] === "\n") {
    return text.slice(0, -1);
  } else {
    return text;
  }
}

export function splice(text: string, start: number, deleteCount = 0, insert = "") {
  return text.substring(0, start) + insert + text.substring(start + deleteCount);
}
