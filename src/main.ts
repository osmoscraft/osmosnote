import fastify from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { handleNoteRoute } from "./routes/note";
import { handleNoteListRoute } from "./routes/note-list";
import { handleSearchRoute } from "./routes/search";

const server = fastify();

server.get("/api/search", handleSearchRoute);
server.get("/api/notes", handleNoteListRoute);
server.get("/api/notes/:id", handleNoteRoute);

const publicPath = path.join(__dirname, "../public");
server.register(fastifyStatic, { root: publicPath });

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`server started at ${address}`);
});
