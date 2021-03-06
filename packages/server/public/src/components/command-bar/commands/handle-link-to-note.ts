// TBD
import { ensureNoteTitle } from "../../../utils/ensure-note-title.js";
import { getLowerCaseUrl } from "../../../utils/url.js";
import type { CommandHandler } from "../command-bar.component.js";
import { handleInsertNote } from "./handle-insert-note.js";
import { parseQuery } from "./parse-query.js";

export const handleLinkToNote: CommandHandler = async ({ input, context }) => {
  const selectedText = context.componentRefs.textEditor.getSelectedText();

  // Same behavior as insert when there is no selection
  if (!selectedText) return handleInsertNote({ input, context });

  const query = input.args?.trim() ?? "";
  const { phrase, tags } = parseQuery(query);
  const url = getLowerCaseUrl(phrase);

  const searchParams = new URLSearchParams();
  const newNoteTitle = ensureNoteTitle(phrase);
  if (url) {
    searchParams.set("url", url);
  } else {
    searchParams.set("title", newNoteTitle);
  }
  const newNoteUrl = `/?${searchParams}`;

  return {};
};
