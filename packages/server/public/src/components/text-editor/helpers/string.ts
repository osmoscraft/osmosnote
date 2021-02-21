export function removeLineEnding(text: string): string {
  if (text.length && text[text.length - 1] === "\n") {
    return text.slice(0, -1);
  } else {
    return text;
  }
}

export function ensureLineEnding(text: string): string {
  if (text.length && text[text.length - 1] === "\n") {
    return text;
  } else {
    return text + "\n";
  }
}

export function splice(text: string, start: number, deleteCount = 0, insert = "") {
  return text.substring(0, start) + insert + text.substring(start + deleteCount);
}

export function reverse(text: string): string {
  return text.split("").reverse().join("");
}