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

/**
 * Get the index of the first word end character from the beginning of the string
 * Assuming the input ends with a new line character
 */
export function getWordEndOffset(text: string): number {
  let wordEndMatch = text.match(/^(\s*?)(\w+|[^\w\s]+)(\w|\s|[^\w\s])/);
  if (wordEndMatch) {
    const [raw, spaces, chunk, suffix] = wordEndMatch;
    const moveDistance = spaces.length + chunk.length;
    return moveDistance;
  }

  // if there is no match, the line must be empty. Set to the character before line end
  return text.indexOf("\n");
}
