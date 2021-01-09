export async function describe(suiteName: string, runSuite: () => any) {
  try {
    await runSuite();
  } catch (error) {
    console.error(`${suiteName} failed.`);
    throw error;
  }
}

export async function it(specName: string, runSpec: () => any) {
  try {
    await runSpec();
  } catch (error) {
    console.error(`${specName} failed.`);
    throw error;
  }
}
