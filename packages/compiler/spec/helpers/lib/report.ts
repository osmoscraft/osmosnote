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
        console.log(red(`  ${spec.error!.toString()}`));
      });
    });

    console.log("");
    console.log(bold(red("[FAIL] ")) + bold(red(`${failedSpecCount} fail`)) + red(` (${totalSpecCount} specs total)`));
  } else {
    console.log(
      bold(green("[PASS] ")) + bold(green(`${totalSpecCount} pass`)) + green(` (${totalSpecCount} specs total)`)
    );
  }
}
