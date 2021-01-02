import fastify from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { handleVersions } from "./routes/versions";
import { handleCreateNote, handleGetNote, handleUpdateNote } from "./routes/note";
import { handleGetNoteList } from "./routes/note-list";
import { handleSearch } from "./routes/search";
import { getConfig } from "./config";
import { handleCrawl } from "./routes/crawl";

async function run() {
  const server = fastify();

  server.post("/api/search", handleSearch);
  server.get("/api/notes", handleGetNoteList);
  server.post("/api/notes", handleCreateNote);
  server.get("/api/notes/:id", handleGetNote);
  server.put("/api/notes/:id", handleUpdateNote);
  server.post("/api/versions", handleVersions);
  server.post("/api/crawl", handleCrawl);

  const publicPath = path.join(__dirname, "../public");
  server.register(fastifyStatic, { root: publicPath });

  const config = await getConfig();

  server.listen(config.port, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`server started at ${address}`);
  });
}

run();
