export function throwError(name: string, message: string) {
  const error = new Error(message);
  error.name = name;
  throw error;
}
