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

export function getRunShellError(result: RunShellResult, message: string) {
  if (result.error) {
    console.error(message);
    result.error?.name.length && console.log("error name", result.error.name);
    result.error?.code && console.log("error code", result.error.code);
    result.error?.message.length && console.log("error message", result.error.message);
    result.stderr?.length && console.log("stderr", result.stderr);

    return {
      message,
    };
  }
}
