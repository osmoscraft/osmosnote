export interface LineElement extends HTMLDivElement {
  dataset: {
    line: "" | "heading" | "meta";
    meta?: "title" | "tags";
  };
}

export function sourceToLines(source: string) {
  const result = document.createDocumentFragment();

  const lines = source.split("\n");

  lines.forEach((line) => {
    const lineDom = document.createElement("div") as LineElement;
    lineDom.dataset.line = "";

    lineDom.textContent = `${line}\n`;

    result.appendChild(lineDom);
  });

  return result;
}
