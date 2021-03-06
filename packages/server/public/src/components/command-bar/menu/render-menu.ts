import type { SearchNoteOutput, GetRecentNotesOutput, GetContentFromUrlOutput } from "@system-two/server";
import { filenameToId } from "../../../utils/id.js";
import type { RegisteredCommand } from "../command-bar.component.js";

export function renderChildCommands(childCommand: RegisteredCommand[]) {
  const html = childCommand
    .map(
      (command) =>
        /*html*/ `<s2-menu-row data-command-key="${command.key}" data-kind="option" data-label="[${command.key}] ${command.name}"></s2-menu-row>`
    )
    .join("");
  return html;
}

export function renderSearchResultSectionForOpen(searchReply: SearchNoteOutput): string {
  const isSearchError = !searchReply?.items;
  const isSearchEmpty = searchReply.items && !searchReply.items.length;

  return /*html */ `
  <s2-menu-row data-kind="header" data-label="Search results"></s2-menu-row>
  ${isSearchError ? /*html*/ `<s2-menu-row data-kind="message" data-label="Error searching"></s2-menu-row>` : ""}
  ${isSearchEmpty ? /*html*/ `<s2-menu-row data-kind="message" data-label="No items found"></s2-menu-row>` : ""}
  ${searchReply.items
    .map(
      (item) =>
        /*html*/ `<s2-menu-row data-open-url="${`/?id=${filenameToId(
          item.filename
        )}`}" data-kind="option" data-label="${item.title}"></s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderSearchResultSectionForInsert(searchReply: SearchNoteOutput): string {
  const isSearchError = !searchReply?.items;
  const isSearchEmpty = searchReply.items && !searchReply.items.length;

  return /*html */ `
  <s2-menu-row data-kind="header" data-label="Search results"></s2-menu-row>
  ${isSearchError ? /*html*/ `<s2-menu-row data-kind="message" data-label="Error searching"></s2-menu-row>` : ""}
  ${isSearchEmpty ? /*html*/ `<s2-menu-row data-kind="message" data-label="No items found"></s2-menu-row>` : ""}
  ${searchReply.items
    .map(
      (item) =>
        /*html*/ `<s2-menu-row data-insert-text="[${item.title}](${filenameToId(
          item.filename
        )})" data-kind="option" data-label="${item.title}"></s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderRecentNotesForOpen(getRecentNotesOutput: GetRecentNotesOutput): string {
  const isRecentError = !getRecentNotesOutput?.notes;
  const isRecentEmpty = getRecentNotesOutput.notes && !getRecentNotesOutput.notes.length;

  return /*html */ `
  <s2-menu-row data-kind="header" data-label="Recent"></s2-menu-row>
  ${
    isRecentError
      ? /*html*/ `<s2-menu-row data-kind="message" data-label="Error finding recent items"></s2-menu-row>`
      : ""
  }
  ${isRecentEmpty ? /*html*/ `<s2-menu-row data-kind="message" data-label="No items found"></s2-menu-row>` : ""}
  ${getRecentNotesOutput.notes
    .map(
      (item) =>
        /*html*/ `<s2-menu-row data-open-url="${`/?id=${filenameToId(
          item.filename
        )}`}" data-kind="option" data-label="${item.title}"></s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderRecentNotesForInsert(listNotesOutput: GetRecentNotesOutput): string {
  const isRecentError = !listNotesOutput?.notes;
  const isRecentEmpty = listNotesOutput.notes && !listNotesOutput.notes.length;

  return /*html */ `
  <s2-menu-row data-kind="header" data-label="Recent"></s2-menu-row>
  ${
    isRecentError
      ? /*html*/ `<s2-menu-row data-kind="message" data-label="Error finding recent items"></s2-menu-row>`
      : ""
  }
  ${isRecentEmpty ? /*html*/ `<s2-menu-row data-kind="message" data-label="No items found"></s2-menu-row>` : ""}
  ${listNotesOutput.notes
    .map(
      (item) =>
        /*html*/ `<s2-menu-row data-insert-text="[${item.title}](${filenameToId(
          item.filename
        )})" data-kind="option" data-label="${item.title}"></s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderCrawlResultForInsert(content: GetContentFromUrlOutput): string {
  const searchParams = new URLSearchParams();
  searchParams.set("url", content.canonicalUrl);
  searchParams.set("title", content.title);
  searchParams.set("content", content.description);
  const openUrl = `/?${searchParams}`;

  return /*html*/ `<s2-menu-row data-kind="option" data-insert-on-save="${openUrl}" data-label="${content.title}"></s2-menu-row>`;
}

export function renderHeaderRow(title: string) {
  return /*html*/ `<s2-menu-row data-kind="header" data-label="${title}"></s2-menu-row>`;
}

export function renderMessageRow(message: string) {
  return /*html*/ `<s2-menu-row data-kind="message" data-label="${message}"></s2-menu-row>`;
}
