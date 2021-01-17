import { getConfig } from "../config";
import fs from "fs-extra";
import path from "path";

export const readNote = async (filename: string): Promise<string> => {
  const { notesDir } = await getConfig();

  const rawMarkdown = await fs.readFile(path.join(notesDir, filename), "utf-8");

  return rawMarkdown;
};

export const writeNote = async (filename: string, data: string): Promise<void> => {
  const { notesDir } = await getConfig();

  await fs.writeFile(path.join(notesDir, filename), data);
};
