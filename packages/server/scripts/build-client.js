const isWatch = process.argv.includes("--watch");

require("esbuild")
  .build({
    entryPoints: ["public/src/pages/home/index.ts", "public/src/pages/settings/index.ts"],
    bundle: true,
    outdir: "public/dist/pages",
    sourcemap: true,
    watch: isWatch
      ? {
          onRebuild(error, result) {
            if (error) console.error("watch build failed:", error);
            else console.log("watch build succeeded:", result);
          },
        }
      : undefined,
  })
  .then(() => console.log("watching..."))
  .catch(() => process.exit(1));
