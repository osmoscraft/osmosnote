export function ensureNoteTitle(title?: string | null): string {
  const trimmedTitle = title?.trim();
  return trimmedTitle?.length ? trimmedTitle : `New note on ${new Date().toLocaleString()}`;
}
