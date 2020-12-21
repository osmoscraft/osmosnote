import type { UpdateNoteBody, UpdateNoteReply } from "@system-two/server/src/routes/note";
import type { SearchResult } from "@system-two/server/src/routes/search";
import { filenameToId } from "../../lib/id";
import { getNoteConfigFromUrl } from "../../lib/url";
import type { ContentHostComponent } from "../content-host/content-host.component";
import type { StatusBarComponent } from "../status-bar/status-bar.component";
import type { CommandInput } from "./command-bar.component";

export interface CommandHandlers {
  [key: string]: CommandHandler;
}

export interface CommandHandlerContext {
  contentHost: ContentHostComponent;
  statusBar: StatusBarComponent;
  titleDom: HTMLElement;
}

export interface CommandHandler {
  (props: { command: CommandInput; execute?: boolean; context: CommandHandlerContext }):
    | CommandHandlerResult
    | Promise<CommandHandlerResult>;
}

export interface CommandHandlerResult {
  optionsHtml?: string;
}

const handleFileSave: CommandHandler = async ({ command, context }) => {
  // save changes to note
  const updateNoteBody: UpdateNoteBody = {
    note: {
      metadata: {
        title: context.titleDom.innerText,
      },
      content: context.contentHost.getMarkdown(),
    },
  };

  const { filename } = getNoteConfigFromUrl();
  if (!filename) {
    //TODO show error
    return {};
  }

  const id = filenameToId(filename);

  const response = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateNoteBody),
  });
  const result: UpdateNoteReply = await response.json();

  context.statusBar.showText(`[editor] updated ${result.note.metadata.title}`);
  return {};
};

const handleSearchNote: CommandHandler = async ({ command, execute }) => {
  const phrase = command.args;

  if (!execute) {
    let optionsHtml = /*html*/ `<div class="cmdbr-option cmdbr-option--header">Search and select a note</div>`;

    if (phrase?.length) {
      const params = new URLSearchParams({
        phrase,
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      const result: SearchResult = await response.json();

      optionsHtml += result.items
        .map(
          (item) => /*html*/ `
          <button class="cmdbr-option cmdbr-option--btn" data-link="[${item.title}](${filenameToId(item.filename)})">${
            item.title
          }</button>`
        )
        .join("");
    } else {
      optionsHtml += /*html*/ `<div class="cmdbr-option">Type to search</div>`;
    }

    return {
      optionsHtml,
    };
  } else {
    return {};
  }
};

export const commandHandlers: CommandHandlers = {
  sn: handleSearchNote,
  fs: handleFileSave,
};
