const reset = `\x1b[0m\x1b[0m`;

export function red(input: string) {
  return `\x1b[31m${input}\x1b[89m${reset}`;
}

export function green(input: string) {
  return `\x1b[32m${input}\x1b[89m${reset}`;
}

export function blue(input: string) {
  return `\x1b[34m${input}\x1b[89m${reset}`;
}

export function bold(input: string) {
  return `\x1b[1m${input}\x1b[22m${reset}`;
}
