export interface SuiteDefinition {
  suiteName: string;
  specs: SpecDefinition[];
}

interface SpecDefinition {
  specName: string;
  runSpec: () => any;
}

const suites: SuiteDefinition[] = [];

let definedSpecs: SpecDefinition[] = [];

export function it(specName: string, runSpec: () => any) {
  definedSpecs.push({
    specName,
    runSpec,
  });
}

export function describe(suiteName: string, defineSpecs: () => any) {
  definedSpecs = [];
  defineSpecs();

  suites.push({
    suiteName,
    specs: definedSpecs,
  });
}

export function define() {
  return suites;
}
