// Create a tag using the current root package version and push the tag to origin
const { version } = require("../package.json");
const { exec } = require("child_process");
const { exit } = require("process");

release();

async function release() {
  console.log(`[tag] add v${version}`);
  const { error, stderr } = await runShell(`git tag v${version}`, { dir: __dirname });
  if (error || stderr) {
    console.error("[tag] error code", error?.code);
    console.error("[tag] error msg", stderr);
    exit(1);
  }

  console.log(`[tag] push v${version}`);
  const { error, stderr } = await runShell(`git push origin v${version}`, { dir: __dirname });
}

async function runShell(command, options) {
  return new Promise((resolve) => {
    exec(command, options, (error, stdout, stderr) =>
      resolve({
        error,
        stdout,
        stderr,
      })
    );
  });
}
