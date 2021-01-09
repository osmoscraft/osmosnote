export function expect(actualValue: any) {
  function toBe(expectedValue: any) {
    const identitiy = actualValue === expectedValue;
    if (!identitiy) {
      throw new Error(`expected ${expectedValue}, received ${actualValue}`);
    }
  }

  return {
    toBe,
  };
}
