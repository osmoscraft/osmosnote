import fastify from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { getConfig } from "./config";
import { getSystemInformation, printDiagnosticsToConsole } from "./lib/diagnostics";
import { blue, bold, green } from "./lib/print";
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

async function run() {
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

  const publicPath = path.join(__dirname, "../public");
  server.register(fastifyStatic, { root: publicPath });

  const config = await getConfig();

  server.listen(config.port, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    printDiagnosticsToConsole().finally(() => {
      console.log(`Frontend: ${bold(green(address))}`);
    });
  });
}

run();
