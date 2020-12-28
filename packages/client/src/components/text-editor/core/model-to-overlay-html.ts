import type { SemanticModel } from "./core";

export function modelToOverlayHtml(model: SemanticModel): string {
  const html = model.lines
    .map((line, i) => {
      const layoutPadding = /*html*/ `<span class="layout-padding">${"_".repeat(line.layoutPadding)}</span>`;

      const headingPrefix = line.isHeading
        ? /*html*/ `<span class="s2-heading__hidden-hash">${"#".repeat(line.sectionLevel - 1)}</span><span>#</span> `
        : "";

      return /*html*/ `<pre class="semovl-line">${layoutPadding}${headingPrefix}${
        line.isEmpty ? "↵" : line.innerText
      }</pre>`;
    })
    .join("");

  return html;
}
