export function expect(actualValue: any) {
  function toBe(expectedValue: any) {
    return console.assert(actualValue === expectedValue, `expected ${actualValue}, received ${actualValue}`);
  }

  return {
    toBe,
  };
}
