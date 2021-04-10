import { homedir } from "os";
import { bold, gray, red } from "./print";
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

export async function printDiagnosticsToConsole() {
  const systemInformation = await getSystemInformation();
  let { version, ...rest } = systemInformation;

  console.log(bold(`Osmos Note ${version ?? bold(red("version unknown"))}`));
  const dependencyNames = Object.keys(rest);
  dependencyNames.forEach((dependencyNames) => {
    const value = (rest as any)[dependencyNames];
    console.log(gray(`${dependencyNames}: ${value ? value : bold(red(value))}`));
  });
}

export async function getSystemInformation() {
  const version = await getPackageVersion();
  const rgPath = await getBinPath("rg");
  const rgVersion = await getBinVersion("rg", (stdout) => stdout.split("\n")?.[0]?.replace("ripgrep ", ""));
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

export async function getPackageVersion(): Promise<string | null> {
  try {
    const packageJson = require("../../../../package.json");
    return packageJson.version;
  } catch (error) {
    console.error("[diagnostics] error getting package version");
    return null;
  }
}

export async function getBinPath(bin: string): Promise<string | null> {
  try {
    const result = await runShell(`which ${bin}`, { cwd: homedir() });
    const error = getRunShellError(result, `Error executing \`which ${bin}\``);
    if (error) {
      throw error;
    }

    return result.stdout.trim();
  } catch (error) {
    console.error(error?.message);
    return null;
  }
}

export async function getBinVersion(
  bin: string,
  getVerionsFromStdout: (stdout: string) => string = (stdout) => stdout.split("\n")[0]?.split(" ")?.pop() ?? "Unknown",
  getVersionFlag: string = "--version"
): Promise<string | null> {
  try {
    const result = await runShell(`${bin} ${getVersionFlag}`, { cwd: homedir() });
    const error = getRunShellError(result, `Error executing \`${bin} ${getVersionFlag}\``);
    if (error) {
      throw error;
    }

    return getVerionsFromStdout(result.stdout);
  } catch (error) {
    console.error(error?.message);
    return null;
  }
}
