import { blue, green, red } from "./print";
import type { ScheduledSuite } from "./schedule";

export interface TestSummary {
  hasError?: boolean;
  suiteSummaries: SuiteSummary[];
}

export interface SuiteSummary {
  suiteName: string;
  hasError?: boolean;
  specSummaries: SpecSummary[];
}

export interface SpecSummary {
  specName: string;
  error?: string;
}

export async function run(scheduledSuites: ScheduledSuite[]): Promise<TestSummary> {
  const testSummaryDraft: TestSummary = {
    suiteSummaries: [],
  };

  for (let suiteResult of scheduledSuites) {
    const suiteSummaryDraft: SuiteSummary = {
      suiteName: suiteResult.suiteName,
      specSummaries: [],
    };

    process.stdout.write(blue(">"));

    for (let specResultAsync of suiteResult.specResultsAsync) {
      const specResult = await specResultAsync;
      const specSummaryDraft: SpecSummary = {
        specName: specResult.specName,
      };

      if (specResult.error) {
        process.stdout.write(red("x"));
        specSummaryDraft.error = specResult.error;
      } else {
        process.stdout.write(green("."));
      }

      suiteSummaryDraft.specSummaries.push(specSummaryDraft);
    }

    process.stdout.write("\n");

    suiteSummaryDraft.hasError = suiteSummaryDraft.specSummaries.some((spec) => spec.error);
    testSummaryDraft.suiteSummaries.push(suiteSummaryDraft);
  }

  testSummaryDraft.hasError = testSummaryDraft.suiteSummaries.some((suite) => suite.hasError);

  return testSummaryDraft;
}
