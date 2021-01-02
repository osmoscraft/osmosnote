import type { NoteListReply } from "@system-two/server/src/routes/note-list";
import type { SearchReply } from "@system-two/server/src/routes/search";
import { filenameToId } from "../../../utils/id";

export function renderSearchResultSectionForOpen(searchReply: SearchReply): string {
  let html = renderHeaderRow("Search results");

  if (!searchReply?.items) {
    html += renderMessageRow("Error searching");
  } else {
    html += searchReply.items
      .map(
        (item) => /*html*/ `
      <div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-open-note-by-id="${filenameToId(
        item.filename
      )}">${item.title}</div>`
      )
      .join("");

    if (!searchReply.items.length) {
      html += renderMessageRow("No items found");
    }
  }

  return html;
}

export function renderSearchResultSectionForInsert(searchReply: SearchReply): string {
  let html = renderHeaderRow("Search results");

  if (!searchReply?.items) {
    html += renderMessageRow("Error searching");
  } else {
    html += searchReply.items
      .map(
        (item) => /*html*/ `
      <div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-insert-text="[${
        item.title
      }](${filenameToId(item.filename)})">${item.title}</div>`
      )
      .join("");

    if (!searchReply.items.length) {
      html += renderMessageRow("No items found");
    }
  }

  return html;
}

export function renderRecentNotesForOpen(noteListReply: NoteListReply): string {
  let html = renderHeaderRow("Recent");
  html += noteListReply.notes
    .map(
      (item) =>
        /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-open-note-by-id="${filenameToId(
          item.filename
        )}">${item.title}</div>`
    )
    .join("");

  if (!noteListReply.notes.length) {
    html += renderMessageRow("No recent items");
  }

  return html;
}

export function renderRecentNotesForInsert(noteListReply: NoteListReply): string {
  let html = renderHeaderRow("Recent");
  html += noteListReply.notes
    .map(
      (item) =>
        /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--btn" data-option data-insert-text="[${
          item.title
        }](${filenameToId(item.filename)})">${item.title}</div>`
    )
    .join("");

  if (!noteListReply.notes.length) {
    html += renderMessageRow("No recent items");
  }

  return html;
}

export function renderHeaderRow(title: string) {
  return /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--header">${title}</div>`;
}

export function renderMessageRow(message: string) {
  return /*html*/ `<div class="cmdbr-dropdown-row cmdbr-dropdown-row--message">${message}</div>`;
}
