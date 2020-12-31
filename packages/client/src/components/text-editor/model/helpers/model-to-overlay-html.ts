import type { EditorModel } from "../editor-model";

export function modelToOverlayHtml(model: EditorModel): string {
  const html = model.lines
    .map((line, i) => {
      return /*html*/ `<s2-line-overlay
        data-raw="${line.fileRaw}"
        data-section-level="${line.sectionLevel}"
        data-is-invalid="${line.isFormatNeeded}"
        data-is-heading="${line.isHeading}"
        data-inner-text="${line.innerText}"
        data-is-empty="${line.isEmpty}"
        data-layout-padding="${line.indentation}"></s2-line-overlay>`;
    })
    .join("");

  return html;
}
