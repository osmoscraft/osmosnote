export function unique<T>(a: T[], keyFn?: (item: T) => any) {
  let seen = new Set();
  return a.filter((item) => {
    let k = keyFn ? keyFn(item) : item;
    return seen.has(k) ? false : seen.add(k);
  });
}
