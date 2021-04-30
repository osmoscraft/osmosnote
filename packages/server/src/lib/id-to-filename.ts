export const STORAGE_FILE_EXTENSION = "haiku";

export function idToFilename(id: string) {
  return `${id}.${STORAGE_FILE_EXTENSION}`;
}
