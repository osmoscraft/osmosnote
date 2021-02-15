import fastify from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { handleGetNote } from "./routes/get-note";
import { getConfig } from "./config";
import { handleUpdateNote } from "./routes/update-note";

async function run() {
  const server = fastify();

  server.post("/api/get-note", handleGetNote);
  server.post("/api/update-note", handleUpdateNote);

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
