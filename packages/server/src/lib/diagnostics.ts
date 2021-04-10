import { getRunShellError, runShell } from "./run-shell";

export interface SystemInformation {
  version: string | null;
  rgPath: string | null;
  rgVersion: string | null;
  gitPath: string | null;
  gitVersion: string | null;
  xargsPath: string | null;
  xargsVersion: string | null;
}

export async function getSystemInformation() {
  const version = getPackageVersion();
  const rgPath = await getBinPath("rg");
  const rgVersion = await getBinVersion("rg");
  const gitPath = await getBinPath("git");
  const gitVersion = await getBinVersion("git");
  const xargsPath = await getBinPath("xargs");
  const xargsVersion = await getBinVersion("xargs");

  return {
    version,
    rgPath,
    rgVersion,
    gitPath,
    gitVersion,
    xargsPath,
    xargsVersion,
  };
}

export function getPackageVersion(): string | null {
  try {
    const packageJson = require("../../../../package.json");
    return packageJson.version;
  } catch (error) {
    console.error("[diagnostics] error getting package version");
    return null;
  }
}

export async function getBinPath(bin: string): Promise<string | null> {
  const result = await runShell(`which ${bin}`);
  const error = getRunShellError(result, `Error executing \`which ${bin}\``);
  if (error) {
    console.error(error.message);
    return null;
  }

  return result.stdout.trim();
}

export async function getBinVersion(
  bin: string,
  getVerionsFromStdout: (stdout: string) => string = (stdout) => stdout.split("\n")[0]?.split(" ")?.pop() ?? "Unknown",
  getVersionFlag: string = "--version"
): Promise<string | null> {
  const result = await runShell(`${bin} ${getVersionFlag}`);
  const error = getRunShellError(result, `Error executing \`${bin} ${getVersionFlag}\``);
  if (error) {
    console.error(error.message);
    return null;
  }

  return getVerionsFromStdout(result.stdout);
}
