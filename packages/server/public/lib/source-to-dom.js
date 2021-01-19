/**
 * 
 * @param {string} source 
 */
export function sourceToDom(source) {

  const result = document.createDocumentFragment();

  const lines = source.split("\n");

  lines.forEach(line => {
    const lineDom = document.createElement("div");
    lineDom.innerText = line;

    // TOOD insert white space to heading rows

    result.appendChild(lineDom);
  })

  return result;
}