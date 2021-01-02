import type { NoteListReply } from "@system-two/server/src/routes/note-list";
import type { SearchReply } from "@system-two/server/src/routes/search";
import { filenameToId } from "../../../utils/id";
import type { RegisteredCommand } from "../command-bar.component";
import { MenuRowComponent } from "./menu-row.component";

customElements.define("s2-menu-row", MenuRowComponent);

export function renderChildCommands(childCommand: RegisteredCommand[]) {
  const html = childCommand
    .map(
      (command) =>
        /*html*/ `<s2-menu-row data-command-key="${command.key}" data-kind="option">[${command.key}] ${command.name}</s2-menu-row>`
    )
    .join("");
  return html;
}

export function renderSearchResultSectionForOpen(searchReply: SearchReply): string {
  const isSearchError = !searchReply?.items;
  const isSearchEmpty = searchReply.items && !searchReply.items.length;

  return /*html */ `
  <s2-menu-row data-kind="header">Search results</s2-menu-row>
  ${isSearchError ? /*html*/ `<s2-menu-row data-kind="message">Error searching</s2-menu-row>` : ""}
  ${isSearchEmpty ? /*html*/ `<s2-menu-row data-kind="message">No items found</s2-menu-row>` : ""}
  ${searchReply.items
    .map(
      (item) =>
        /*html*/ `<s2-menu-row data-open-url="${`/?filename=${item.filename}`}" data-kind="option">${
          item.title
        }</s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderSearchResultSectionForInsert(searchReply: SearchReply): string {
  const isSearchError = !searchReply?.items;
  const isSearchEmpty = searchReply.items && !searchReply.items.length;

  return /*html */ `
  <s2-menu-row data-kind="header">Search results</s2-menu-row>
  ${isSearchError ? /*html*/ `<s2-menu-row data-kind="message">Error searching</s2-menu-row>` : ""}
  ${isSearchEmpty ? /*html*/ `<s2-menu-row data-kind="message">No items found</s2-menu-row>` : ""}
  ${searchReply.items
    .map(
      (item) => /*html*/ `
      <s2-menu-row data-insert-text="[${item.title}](${filenameToId(item.filename)})" data-kind="option">${
        item.title
      }</s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderRecentNotesForOpen(noteListReply: NoteListReply): string {
  const isRecentError = !noteListReply?.notes;
  const isRecentEmpty = noteListReply.notes && !noteListReply.notes.length;

  return /*html */ `
  <s2-menu-row data-kind="header">Recent</s2-menu-row>
  ${isRecentError ? /*html*/ `<s2-menu-row data-kind="message">Error finding recent items</s2-menu-row>` : ""}
  ${isRecentEmpty ? /*html*/ `<s2-menu-row data-kind="message">No items found</s2-menu-row>` : ""}
  ${noteListReply.notes
    .map(
      (item) =>
        /*html*/ `<s2-menu-row data-open-url="${`/?filename=${item.filename}`}" data-kind="option">${
          item.title
        }</s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderRecentNotesForInsert(noteListReply: NoteListReply): string {
  const isRecentError = !noteListReply?.notes;
  const isRecentEmpty = noteListReply.notes && !noteListReply.notes.length;

  return /*html */ `
  <s2-menu-row data-kind="header">Recent</s2-menu-row>
  ${isRecentError ? /*html*/ `<s2-menu-row data-kind="message">Error finding recent items</s2-menu-row>` : ""}
  ${isRecentEmpty ? /*html*/ `<s2-menu-row data-kind="message">No items found</s2-menu-row>` : ""}
  ${noteListReply.notes
    .map(
      (item) =>
        /*html*/ `<s2-menu-row data-insert-text="[${item.title}](${filenameToId(item.filename)})" data-kind="option">${
          item.title
        }</s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderHeaderRow(title: string) {
  return /*html*/ `<s2-menu-row data-kind="header">${title}</s2-menu-row>`;
}

export function renderMessageRow(message: string) {
  return /*html*/ `<s2-menu-row data-kind="header">${message}</s2-menu-row>`;
}
