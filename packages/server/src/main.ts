import fastify from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { getConfig } from "./config";
import { handleCreateNote } from "./routes/create-note";
import { handleGetMentions } from "./routes/get-mentions";
import { handleGetNote } from "./routes/get-note";
import { handleListNotes } from "./routes/list-notes";
import { handleSearchNote } from "./routes/search-note";
import { handleUpdateNote } from "./routes/update-note";

async function run() {
  const server = fastify();

  server.post("/api/create-note", handleCreateNote);
  server.post("/api/get-note", handleGetNote);
  server.post("/api/update-note", handleUpdateNote);
  server.post("/api/search-notes", handleSearchNote);
  server.post("/api/list-notes", handleListNotes);
  server.post("/api/get-mentions", handleGetMentions);

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
