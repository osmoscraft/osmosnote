import { throwError } from "./error";

export function expect(actualValue: any) {
  function toBe(expectedValue: any) {
    const identitiy = actualValue === expectedValue;
    if (!identitiy) {
      throwError("IdentityAssertionFailed", `\nExpected:\n${expectedValue}\nActual:\n${actualValue}`);
    }
  }

  return {
    toBe,
  };
}
