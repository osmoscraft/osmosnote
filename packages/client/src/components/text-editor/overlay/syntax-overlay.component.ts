import type { EditorModel } from "../model/editor-model";
import { modelToOverlayHtml } from "../model/helpers/model-to-overlay-html";
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
