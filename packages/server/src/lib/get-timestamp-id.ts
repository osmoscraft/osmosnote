/**
 * Get id in the `YYYYMMDDhhmmssll` format for current UTC time
 */
export function getTimestampId(): string {
  const now = new Date();
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
  return now.toISOString().replace(/-|T|:/g, "").slice(0, 12) + milliseconds;
}
