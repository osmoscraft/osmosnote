import path from "path";
import { STORAGE_FILE_EXTENSION } from "./id-to-filename";

export function filenameToId(filename: string) {
  return path.basename(filename, STORAGE_FILE_EXTENSION);
}
