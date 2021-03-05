import type { CommandHandler } from "../command-bar.component.js";
import { versionCheckRunOnMatch } from "./handle-version-check.js";
import { versionSyncRunOnMatch } from "./handle-version-sync.js";

export const handleVersionsSyncAndCheck: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    await versionSyncRunOnMatch(context);
    await versionCheckRunOnMatch(context);
  },
});
