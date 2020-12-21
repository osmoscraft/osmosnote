import type { ContentHostComponent } from "../../content-host/content-host.component";
import type { StatusBarComponent } from "../../status-bar/status-bar.component";
import type { CommandInput } from "../command-bar.component";
import { handleFileCopyLink } from "./handle-file-copy-link";
import { handleFileSave } from "./handle-file-save";
import { handleSearchNote } from "./handle-search-note";

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

export const commandHandlers: CommandHandlers = {
  s: handleSearchNote,
  fs: handleFileSave,
  fy: handleFileCopyLink,
};
