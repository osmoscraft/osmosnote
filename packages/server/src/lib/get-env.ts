declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OSMOSNOTE_REPO_DIR?: string;
    }
  }
}

export function getEnv() {
  return process.env;
}
