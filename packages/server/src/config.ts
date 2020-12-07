import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import os from "os";

export interface Config {
  notesDir: string;
}

const CONFIG_DIR_FROM_HOME = `.config/platojar`;

export async function getConfig(): Promise<Config> {
  const sourcesText = fs.readFileSync(path.join(os.homedir(), CONFIG_DIR_FROM_HOME, "system-two.yaml"), "utf8");
  const customizedConfig = yaml.safeLoad(sourcesText);

  return customizedConfig as Config;
}
