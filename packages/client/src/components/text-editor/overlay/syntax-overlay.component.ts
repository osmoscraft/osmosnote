import type { EditorModel } from "../model/editor-model";
import { modelToOverlayHtml } from "../model/helpers/model-to-overlay-html";
import { LineOverlayComponent } from "./parts/line-overlay.component";
import { LinkOverlayComponent } from "./parts/link-overlay.component";
import { TagOverlayComponent } from "./parts/tag-overlay.component";
import "./syntax-overlay.css";

export class SyntaxOverlayComponent extends HTMLElement {
  updateModel(semanticModel: EditorModel) {
    this.innerHTML = modelToOverlayHtml(semanticModel);
  }

  updateScroll(referenceDom: HTMLElement) {
    this.scrollTop = referenceDom.scrollTop;
    this.scrollLeft = referenceDom.scrollLeft;
  }
}

customElements.define("s2-link-overlay", LinkOverlayComponent);
customElements.define("s2-line-overlay", LineOverlayComponent);
customElements.define("s2-tag-overlay", TagOverlayComponent);
