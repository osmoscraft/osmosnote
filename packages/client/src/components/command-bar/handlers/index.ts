import type { ComponentReferenceService } from "../../../services/component-reference/component-reference.service";
import type { CommandInput } from "../command-bar.component";
import { handleFileCopyLink } from "./handle-file-copy-link";
import { handleFileSave } from "./handle-file-save";
import { handleSearchNote } from "./handle-search-note";
import { handleSlash } from "./handle-slash";

export interface CommandHandlers {
  [key: string]: CommandHandler;
}

export interface CommandHandlerContext {
  componentRefs: ComponentReferenceService;
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
  n: handleSearchNote,
  fs: handleFileSave,
  fy: handleFileCopyLink,
};
