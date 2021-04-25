import { getRepoMetadata } from "./repo-metadata";
import fs from "fs-extra";
import path from "path";

export const readNote = async (filename: string): Promise<string> => {
  const { repoDir: notesDir } = await getRepoMetadata();

  const rawMarkdown = await fs.readFile(path.join(notesDir, filename), "utf-8");

  return rawMarkdown;
};

export const writeNote = async (filename: string, data: string): Promise<void> => {
  const { repoDir: notesDir } = await getRepoMetadata();

  await fs.writeFile(path.join(notesDir, filename), data);
};

export const deleteNote = async (filename: string): Promise<void> => {
  const { repoDir: notesDir } = await getRepoMetadata();

  const candidatePath = path.join(notesDir, filename);

  // extra safety check
  const stat = await fs.lstat(candidatePath);
  if (!stat.isFile()) {
    throw new Error("Delete note received a directory. Nothing is deleted. Likely a mistake.");
  }

  await fs.remove(path.join(notesDir, filename));
};
