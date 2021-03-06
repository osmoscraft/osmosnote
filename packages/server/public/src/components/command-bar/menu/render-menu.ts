import type {
  SearchNoteOutput,
  GetRecentNotesOutput,
  GetContentFromUrlOutput,
  RecentNoteItem,
  SearchResultItem,
} from "@system-two/server";
import { filenameToId } from "../../../utils/id.js";
import type { RegisteredCommand } from "../command-bar.component.js";
import { PayloadAction } from "./menu-row.component.js";

export function renderChildCommands(childCommand: RegisteredCommand[]) {
  const html = childCommand
    .map(
      (command) =>
        /*html*/ `<s2-menu-row data-command-key="${command.key}" data-kind="option" data-label="[${command.key}] ${command.name}"></s2-menu-row>`
    )
    .join("");
  return html;
}

export function renderSearchResultSection(
  searchReply: SearchNoteOutput,
  action: PayloadAction.openNoteById | PayloadAction.insertText | PayloadAction.linkToNoteById
): string {
  const isSearchError = !searchReply?.items;
  const isSearchEmpty = searchReply.items && !searchReply.items.length;

  const getPayload = (item: SearchResultItem) => {
    switch (action) {
      case PayloadAction.openNoteById:
      case PayloadAction.linkToNoteById:
        return filenameToId(item.filename);
      case PayloadAction.insertText:
        return `[${item.title}](${filenameToId(item.filename)})`;
    }
  };

  return /*html */ `
  <s2-menu-row data-kind="header" data-label="Open search result"></s2-menu-row>
  ${isSearchError ? /*html*/ `<s2-menu-row data-kind="message" data-label="Error searching"></s2-menu-row>` : ""}
  ${isSearchEmpty ? /*html*/ `<s2-menu-row data-kind="message" data-label="No items found"></s2-menu-row>` : ""}
  ${searchReply.items
    .map(
      (item) => /*html*/ `<s2-menu-row
        data-payload="${getPayload(item)}"
        data-payload-action=${action}
        data-kind="option"
        data-label="${item.title}"></s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderRecentNotes(
  getRecentNotesOutput: GetRecentNotesOutput,
  action: PayloadAction.openNoteById | PayloadAction.insertText | PayloadAction.linkToNoteById
): string {
  const isRecentError = !getRecentNotesOutput?.notes;
  const isRecentEmpty = getRecentNotesOutput.notes && !getRecentNotesOutput.notes.length;

  const getPayload = (item: RecentNoteItem) => {
    switch (action) {
      case PayloadAction.openNoteById:
      case PayloadAction.linkToNoteById:
        return filenameToId(item.filename);
      case PayloadAction.insertText:
        return `[${item.title}](${filenameToId(item.filename)})`;
    }
  };

  return /*html */ `
  <s2-menu-row data-kind="header" data-label="Open recent"></s2-menu-row>
  ${
    isRecentError
      ? /*html*/ `<s2-menu-row data-kind="message" data-label="Error finding recent items"></s2-menu-row>`
      : ""
  }
  ${isRecentEmpty ? /*html*/ `<s2-menu-row data-kind="message" data-label="No items found"></s2-menu-row>` : ""}
  ${getRecentNotesOutput.notes
    .map(
      (item) => /*html*/ `<s2-menu-row
          data-payload="${getPayload(item)}"
          data-payload-action=${action}
          data-kind="option"
          data-label="${item.title}"></s2-menu-row>`
    )
    .join("")}
  `;
}

export function renderCrawlResult(
  content: GetContentFromUrlOutput,
  action: PayloadAction.insertNewNoteByUrl | PayloadAction.openNoteByUrl | PayloadAction.linkToNewNoteByUrl
): string {
  const searchParams = new URLSearchParams();
  searchParams.set("url", content.canonicalUrl);
  searchParams.set("title", content.title);
  searchParams.set("content", content.description);
  const openUrl = `/?${searchParams}`;

  return /*html*/ `<s2-menu-row data-kind="option" data-payload="${openUrl}" data-payload-action="${action}" data-label="${content.title}"></s2-menu-row>`;
}

export function renderHeaderRow(title: string) {
  return /*html*/ `<s2-menu-row data-kind="header" data-label="${title}"></s2-menu-row>`;
}

export function renderMessageRow(message: string) {
  return /*html*/ `<s2-menu-row data-kind="message" data-label="${message}"></s2-menu-row>`;
}

export function renderNoteWithUrl(url: string, title: string, action: PayloadAction) {
  return /*html*/ `<s2-menu-row data-kind="option" data-payload="${url}" data-payload-action="${action}" data-label="${title}"></s2-menu-row>`;
}
