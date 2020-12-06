import fastify from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { handleNotesRoute } from "./routes/notes";
import { handleSearchRoute } from "./routes/search";

const server = fastify();

server.get("/api/search", handleSearchRoute);
server.get("/api/notes/:id", handleNotesRoute);

const publicPath = path.join(__dirname, "../public");
server.register(fastifyStatic, { root: publicPath });

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`server started at ${address}`);
});
