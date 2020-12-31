import fs from "fs-extra";
import path from "path";
import yaml from "js-yaml";
import os from "os";
import { DEFAULT_CONFIG_YAML } from "./lib/default-config";

export interface Config {
  notesDir: string;
  port: number;
}

const CONFIG_DIR_FROM_HOME = `.config/system-two`;
const CONFIG_FILENAMER = "config.yaml";
const DEFAULT_REPO_FROM_HOME = ".system-two/repo";

const DEFAULT_CONFIG: Config = {
  notesDir: path.join(os.homedir(), DEFAULT_REPO_FROM_HOME),
  port: 2077,
};

export async function getConfig(): Promise<Config> {
  try {
    const configFilePath = path.join(os.homedir(), CONFIG_DIR_FROM_HOME, CONFIG_FILENAMER);

    if (!fs.existsSync(configFilePath)) {
      console.log(`[config] Config file does not exist, will create ${configFilePath}`);
      fs.ensureFileSync(configFilePath);
      fs.writeFileSync(configFilePath, DEFAULT_CONFIG_YAML);
      console.log(`[config] Config file created`);
    }

    const sourcesText = fs.readFileSync(configFilePath, "utf8");
    const customizedConfig = yaml.safeLoad(sourcesText);
    const customizedConfigObj = (typeof customizedConfig === "string" ? {} : customizedConfig) ?? {};
    const config = { ...DEFAULT_CONFIG, ...customizedConfigObj };

    return config as Config;
  } catch {
    console.log("[config] Config file does not exist and cannot be auto created, using default");

    return DEFAULT_CONFIG;
  }
}
