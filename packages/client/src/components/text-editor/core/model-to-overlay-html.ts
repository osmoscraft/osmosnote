import type { SemanticModel } from "./core";
import { LineOverlayComponent } from "./overlay/line-overlay.component";
import { LinkOverlayComponent } from "./overlay/link-overlay.component";

export function modelToOverlayHtml(model: SemanticModel): string {
  const html = model.lines
    .map((line, i) => {
      return /*html*/ `<s2-line-overlay
        data-section-level="${line.sectionLevel}"
        data-is-heading="${line.isHeading}"
        data-inner-text="${line.innerText}"
        data-is-empty="${line.isEmpty}"
        data-layout-padding="${line.layoutPadding}"></s2-line-overlay>`;
    })
    .join("");

  return html;
}

customElements.define("s2-link-overlay", LinkOverlayComponent);
customElements.define("s2-line-overlay", LineOverlayComponent);
