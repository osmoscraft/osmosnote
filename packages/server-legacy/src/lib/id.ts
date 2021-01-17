/**
 * Get id in the `YYYYMMDDhhmmss` format for current UTC time
 */
export function getCurrentId() {
  return new Date().toISOString().replace(/-|T|:/g, "").slice(0, 12);
}
