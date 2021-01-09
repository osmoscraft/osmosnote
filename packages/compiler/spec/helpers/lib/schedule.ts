import type { SuiteDefinition } from "./define";

export interface ScheduledSuite {
  suiteName: string;
  specResultsAsync: Promise<SpecResult>[];
}

export interface SpecResult {
  specName: string;
  error?: any;
}

export function schedule(suites: SuiteDefinition[]) {
  // Run all suites and specs in parallel
  const suiteResultsAsync: ScheduledSuite[] = suites.map((suite) => {
    const suiteResult: ScheduledSuite = {
      suiteName: suite.suiteName,
      specResultsAsync: [],
    };

    const resultsAsync: Promise<SpecResult>[] = suite.specs.map(async (spec) => {
      const specResult: SpecResult = {
        specName: spec.specName,
      };

      try {
        await spec.runSpec();
      } catch (error) {
        specResult.error = error;
      }

      return specResult;
    });

    suiteResult.specResultsAsync = resultsAsync;

    return suiteResult;
  });

  return suiteResultsAsync;
}
