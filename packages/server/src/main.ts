import fastify from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { getAppConfig } from "./lib/app-config";
import { printDiagnosticsToConsole } from "./lib/diagnostics";
import { ensureRepoConfig } from "./lib/repo-config";
import { bold, green } from "./lib/print";
import { runShell } from "./lib/run-shell";
import { handleCreateNote } from "./routes/create-note";
import { handleDeleteNote } from "./routes/delete-note";
import { handleGetContentFromUrl } from "./routes/get-content-from-url";
import { handleGetIncomingLinks } from "./routes/get-incoming-links";
import { handleGetNote } from "./routes/get-note";
import { handleGetRecentNotes } from "./routes/get-recent-notes";
import { handleGetRecentTags } from "./routes/get-recent-tags";
import { handleGetSystemInformation } from "./routes/get-system-information";
import { handleGetVersionStatus } from "./routes/get-version-status";
import { handleLookupTags } from "./routes/lookup-tags";
import { handleSearchNote } from "./routes/search-note";
import { handleSyncVersions } from "./routes/sync-versions";
import { handleUpdateNote } from "./routes/update-note";

// check if repo has .git dir

async function run() {
  /**
   * Initialization sequence
   *
   * 1. Check dependency
   *    1. xargs
   *    2. git
   *    2. ripgrep
   * 2. Check repo location from ENV
   * 3. If location doesn't contain osmosnote.json, finish with need-initialization status.
   * 4. Finish initialization sucess. Display config in console.
   */
  await ensureRepoConfig();
  const config = await getAppConfig();

  console.log(`repo: ${config.notesDir}`);
  const publicPath = path.join(__dirname, "../public");
  console.log(`public: ${publicPath}`);

  // TODO, do this inside the repo dir, after initialization
  await runShell(`git config --global user.email "osmosnote-bot@osmoscraft.org"`);
  await runShell(`git config --global user.name"osmosnote bot"`);

  const server = fastify();

  server.post("/api/create-note", handleCreateNote);
  server.post("/api/delete-note", handleDeleteNote);
  server.post("/api/get-content-from-url", handleGetContentFromUrl);
  server.post("/api/get-incoming-links", handleGetIncomingLinks);
  server.post("/api/get-note", handleGetNote);
  server.post("/api/get-recent-notes", handleGetRecentNotes);
  server.post("/api/get-recent-tags", handleGetRecentTags);
  server.post("/api/get-system-information", handleGetSystemInformation);
  server.post("/api/get-version-status", handleGetVersionStatus);
  server.post("/api/lookup-tags", handleLookupTags);
  server.post("/api/search-notes", handleSearchNote);
  server.post("/api/sync-versions", handleSyncVersions);
  server.post("/api/update-note", handleUpdateNote);

  server.register(fastifyStatic, { root: publicPath });

  server.listen(config.port, "0.0.0.0", async (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Frontend: ${bold(green(address))}`);
  });
}

run();
