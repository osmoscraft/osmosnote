import { blue, bold, green, red } from "./print";
import type { TestSummary } from "./run";

export async function report(summary: TestSummary) {
  printSummary(summary);

  if (summary.hasError) {
    process.exit(1);
  }
}

function printSummary(summary: TestSummary) {
  console.log("");

  const totalSpecCount = summary.suiteSummaries.reduce((total, suite) => total + suite.specSummaries.length, 0);
  const failedSpecCount = summary.suiteSummaries.reduce(
    (total, suite) => total + suite.specSummaries.filter((spec) => spec.error).length,
    0
  );

  const failedSuites = summary.suiteSummaries.filter((suite) => suite.hasError);

  if (failedSuites.length) {
    failedSuites.forEach((suite) => {
      console.log(`${bold(blue(suite.suiteName))}`);
      const failedSpecs = suite.specSummaries.filter((spec) => spec.error);
      failedSpecs.forEach((spec) => {
        console.log(bold(blue(`- ${spec.specName}`)));
        console.log(bold(red(`  ${spec.error?.name ?? "Unknown error"}`)));
        console.log(
          red(
            `${spec
              .error!.message.trim()
              .split("\n")
              .map((line) => `    ${line.trim()}`) // equal padding to every line
              .join("\n")}`
          )
        );
      });
    });

    console.log("");
    console.log(
      bold(red("[FAIL] ")) + red(`Specs: `) + bold(red(`${failedSpecCount} fail`)) + red(` (${totalSpecCount} total)`)
    );
  } else {
    console.log(
      bold(green("[PASS] ")) +
        green(`Specs: `) +
        bold(green(`${totalSpecCount} pass`)) +
        green(` (${totalSpecCount} total)`)
    );
  }
}
