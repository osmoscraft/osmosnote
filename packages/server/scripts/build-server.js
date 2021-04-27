require("esbuild")
  .build({
    platform: "node",
    entryPoints: ["src/main.ts"],
    bundle: true,
    target: "node14",
    outfile: "dist/main.js",
  })
  .catch(() => process.exit(1));
