import { exec, ExecException, ExecOptions } from "child_process";

export interface RunShellResult {
  stderr: string;
  stdout: string;
  error: ExecException | null;
}

/**
 * run shell command in a given directory
 * output will be string type
 */
export async function runShell(command: string, options?: ExecOptions): Promise<RunShellResult> {
  return new Promise((resolve) => {
    exec(command, options, (error, stdout, stderr) =>
      resolve({
        error,
        stdout: stdout as string,
        stderr: stderr as string,
      })
    );
  });
}
