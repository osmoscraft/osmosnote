import type { ComponentReferenceService } from "../../../services/component-reference/component-reference.service";
import type { FileStorageService } from "../../../services/file-storage/file-storage.service";
import type { ProxyService } from "../../../services/proxy/proxy.service";
import type { SourceControlService } from "../../../services/source-control/source-control.service";
import type { CommandInput } from "../command-bar.component";
import { handleFileCopyLink } from "./handle-file-copy-link";
import { handleFileFormat } from "./handle-file-format";
import { handleFileSave, handleFileSaveAndSync } from "./handle-file-save";
import { handleInsertUrl } from "./handle-insert-url";
import { handleInsertNote } from "./handle-insert-note";
import { handleCaptureNote } from "./handle-capture-note";
import { handleSlash } from "./handle-slash";
import { handleVersionsCheck, handleVersionsSync } from "./handle-versions";
import { handleGoToEditor, handleGoToHeader, handleGoToReferences } from "./handle-window-travel";
import { handleCaptureUrl } from "./handle-capture-url";
import type { WindowBridgeService } from "../../../services/window-bridge/window-bridge.service";
import { handleInsertTags } from "./handle-insert-tags";

export interface CommandHandlers {
  [key: string]: CommandHandler;
}

export interface CommandHandlerContext {
  componentRefs: ComponentReferenceService;
  fileStorageService: FileStorageService;
  sourceControlService: SourceControlService;
  proxyService: ProxyService;
  windowBridgeService: WindowBridgeService;
}

export interface CommandHandler {
  (props: { input: CommandInput; context: CommandHandlerContext }):
    | CommandHandlerResult
    | Promise<CommandHandlerResult>;
}

export interface CommandHandlerResult {
  /**
   * run when input changes
   * return the html for the dropdown
   */
  updateDropdownOnInput?: () => string | Promise<string>;
  /**
   * run when keydown sequence matches the command
   */
  runOnMatch?: () => any;
  /**
   * run when the command is committed with "Enter" key
   */
  runOnCommit?: () => any;
  /**
   * run when the command is committed with "Enter" key.
   * After commit, command bar remains open with args removed.
   */
  repeatableRunOnCommit?: () => any;
}

export const commandHandlers: CommandHandlers = {
  "/": handleSlash,
  in: handleInsertNote,
  il: handleInsertUrl,
  it: handleInsertTags,
  fo: handleCaptureNote,
  nn: handleCaptureNote,
  nl: handleCaptureUrl,
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
