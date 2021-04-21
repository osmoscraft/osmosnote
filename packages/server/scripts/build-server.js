require("esbuild")
  .build({
    entryPoints: ["public/src/index.ts"],
    bundle: true,
    outfile: "public/dist/index.js",
  })
  .catch(() => process.exit(1));
