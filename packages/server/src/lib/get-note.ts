import { getConfig } from "../config";
import fs from "fs-extra";
import path from "path";

export const getNoteByFilename = async (filename: string): Promise<string> => {
  const config = await getConfig();

  const notesDir = config.notesDir;

  const rawMarkdown = await fs.readFile(path.join(notesDir, filename), "utf-8");

  return rawMarkdown;
};
