export const S2_HEADING_REGEX = /^#{1,6} (.*)/gm; // e.g. # My title
export const S2_HEADING_REPLACER = (_match: string, title: string) => {
  const level = _match.split(" ")[0].length;
  return /*html*/ `<code class="s2-heading__hidden-hash">${"#".repeat(level - 1)}</code><code># </code>${title}`;
};
