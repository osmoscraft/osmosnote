import type { ComponentReferenceService } from "../../../services/component-reference/component-reference.service";
import type { FileStorageService } from "../../../services/file-storage/file-storage.service";
import type { SourceControlService } from "../../../services/source-control/source-control.service";
import type { CommandInput } from "../command-bar.component";
import { handleFileCopyLink } from "./handle-file-copy-link";
import { handleFileFormat } from "./handle-file-format";
import { handleFileSave, handleFileSaveAndSync } from "./handle-file-save";
import { handleInsertNote } from "./handle-insert-note";
import { handleOpenNote } from "./handle-open-note";
import { handleSlash } from "./handle-slash";
import { handleVersionsCheck } from "./handle-versions-check";
import { handleVersionsSync } from "./handle-versions-sync";
import { handleGoToEditor, handleGoToHeader, handleGoToReferences } from "./handle-window-travel";

export interface CommandHandlers {
  [key: string]: CommandHandler;
}

export interface CommandHandlerContext {
  componentRefs: ComponentReferenceService;
  fileStorageService: FileStorageService;
  sourceControlService: SourceControlService;
}

export interface CommandHandler {
  (props: { input: CommandInput; execute?: boolean; context: CommandHandlerContext }):
    | CommandHandlerResult
    | Promise<CommandHandlerResult>;
}

export interface CommandHandlerResult {
  optionsHtml?: string;
  skipCursorRestore?: boolean;
}

export const commandHandlers: CommandHandlers = {
  "i/": handleSlash,
  il: handleInsertNote,
  fo: handleOpenNote,
  fs: handleFileSave,
  fa: handleFileSaveAndSync,
  ff: handleFileFormat,
  fy: handleFileCopyLink,
  gh: handleGoToHeader,
  gr: handleGoToReferences,
  ge: handleGoToEditor,
  vs: handleVersionsSync,
  vc: handleVersionsCheck,
};
