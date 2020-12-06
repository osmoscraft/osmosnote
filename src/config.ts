import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export interface Config {
  notesDir: string;
}

export async function getConfig(): Promise<Config> {
  const sourcesText = fs.readFileSync(path.resolve("system-two.yaml"), "utf8");
  const customizedConfig = yaml.safeLoad(sourcesText);

  return customizedConfig as Config;
}
