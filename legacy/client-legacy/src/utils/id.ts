export function idToFilename(id: string) {
  return `${id}.md`;
}

export function filenameToId(filename: string) {
  return filename.split(".md")[0];
}
