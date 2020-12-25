import type { ContentHostComponent } from "../../content-host/content-host.component";
import type { DocumentHeaderComponent } from "../../document-header/document-header.component";
import type { StatusBarComponent } from "../../status-bar/status-bar.component";
import type { CommandInput } from "../command-bar.component";
import { handleFileCopyLink } from "./handle-file-copy-link";
import { handleFileSave } from "./handle-file-save";
import { handleSearchNote } from "./handle-search-note";
import { handleSlash } from "./handle-slash";

export interface CommandHandlers {
  [key: string]: CommandHandler;
}

export interface CommandHandlerContext {
  contentHost: ContentHostComponent;
  statusBar: StatusBarComponent;
  documentHeader: DocumentHeaderComponent;
}

export interface CommandHandler {
  (props: { command: CommandInput; execute?: boolean; context: CommandHandlerContext }):
    | CommandHandlerResult
    | Promise<CommandHandlerResult>;
}

export interface CommandHandlerResult {
  optionsHtml?: string;
}

export const commandHandlers: CommandHandlers = {
  "/": handleSlash,
  s: handleSearchNote,
  fs: handleFileSave,
  fy: handleFileCopyLink,
};
