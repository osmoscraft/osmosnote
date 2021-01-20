/**
 *
 * @param {string} source
 */
export function sourceToDom(source) {
  const result = document.createDocumentFragment();

  const lines = source.split("\n");

  const context = {
    level: 0,
  };

  lines.forEach((line) => {
    const lineDom = document.createElement("div");

    lineDom.dataset.line = "";

    // TOOD insert white space to heading rows
    let match = line.match(/^(#+) (.*)\n?/);
    if (match) {
      const [raw, hashes, text] = match;
      const indentWidth = hashes.length - 1;
      const indent = ` `.repeat(indentWidth);

      context.level = hashes.length;

      lineDom.textContent = `${indent}${hashes} ${text}\n`;
    } else {
      const indent = ` `.repeat(context.level * 2);
      lineDom.textContent = `${indent}${line ? line : `\n`}`;
    }

    result.appendChild(lineDom);
  });

  return result;
}
