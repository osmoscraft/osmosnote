import type { EngineModel } from "../engine-model";
import { LineOverlayComponent } from "../overlay/line-overlay.component";
import { LinkOverlayComponent } from "../overlay/link-overlay.component";

export function modelToOverlayHtml(model: EngineModel): string {
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

customElements.define("s2-link-overlay", LinkOverlayComponent);
customElements.define("s2-line-overlay", LineOverlayComponent);
