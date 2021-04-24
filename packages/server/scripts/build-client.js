  require("esbuild")
  .build({
    entryPoints: [
      "public/src/pages/home/index.ts",
      "public/src/pages/settings/index.ts"
    ],
    bundle: true,
    outdir: "public/dist/pages",
    sourcemap: true,
  })
  .catch(() => process.exit(1));
