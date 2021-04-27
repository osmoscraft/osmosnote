import { homedir } from "os";
import path from "path";

export interface AppEnv {
  OSMOSNOTE_REPO_DIR: string;
  OSMOSNOTE_SERVER_PORT: number;
}

export function getAppEnv() {
  const appEnv: AppEnv = {
    OSMOSNOTE_REPO_DIR: process.env.OSMOSNOTE_REPO_DIR ?? path.join(homedir(), ".osmosnote/repo"),
    OSMOSNOTE_SERVER_PORT: parseInt(process.env.OSMOSNOTE_SERVER_PORT ?? "6683"),
  };

  return appEnv;
}
