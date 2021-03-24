const tagsToReplace: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function replacer(unsafeChar: string): string {
  return tagsToReplace[unsafeChar] || unsafeChar;
}

export function sanitizeHtml(unsafeString: string): string {
  return unsafeString.replace(/[&<>"]/g, replacer);
}
