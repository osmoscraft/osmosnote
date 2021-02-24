/** Get a string that represents the current time with a resolution to milliseconds */
export function getCurrentId(): string {
  const now = Date.now();
  const alphaNumericString = decimalToAlphaNumeric(now);
  return alphaNumericString;
}

const TARGET_RANGE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const TARGET_RADIX = TARGET_RANGE.length;

/** A simplified version of https://stackoverflow.com/a/32480941/2506795 */
function decimalToAlphaNumeric(value: number) {
  let remainingInput = value;

  let output = "";
  while (remainingInput > 0) {
    output = TARGET_RANGE[remainingInput % TARGET_RADIX] + output;
    remainingInput = (remainingInput - (remainingInput % TARGET_RADIX)) / TARGET_RADIX;
  }
  return output || "0";
}
