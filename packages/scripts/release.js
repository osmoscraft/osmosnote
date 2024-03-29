// Create a tag using the current server package version and push the tag to origin
const { version } = require("../../packages/server/package.json");
const { exec } = require("child_process");
const { exit } = require("process");

release();

async function release() {
	console.log(`[tag] clean up v${version}`);
	const { error: cleanError, stderr: cleanStderr } = await runShell(`git tag -d v${version}`, { dir: __dirname });
	if (cleanError || cleanStderr) {
		console.log(`[tag] nothing to clean up, continue`);
	}

	console.log(`[tag] add v${version}`);
	const { error: addError, stderr: addStderr } = await runShell(`git tag v${version}`, { dir: __dirname });
	if (addError || addStderr) {
		console.error("[tag] add failed");
		console.error("[tag] error code", addError?.code);
		console.error("[tag] error msg", addStderr);
		exit(1);
	}

	console.log(`[tag] push v${version}`);
	const {
		stdout: pushStdout,
		error: pushError,
		stderr: pushStderr,
	} = await runShell(`git push origin v${version}`, { dir: __dirname });
	if (pushError) {
		// Git writes to stderr even when successful
		console.error("[tag] push failed");
		console.error("[tag] error code", pushError?.code);
		console.error("[tag] error msg", pushStderr);
		exit(1);
	}

	console.log(pushStderr ?? pushStdout ?? "No output. Something might be wrong.");
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
