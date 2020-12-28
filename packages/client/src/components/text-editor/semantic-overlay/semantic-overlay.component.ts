import type { SemanticModel } from "../core/core";
import { modelToOverlayHtml } from "../core/model-to-overlay-html";
import "./semantic-overlay.css";

export class SemanticOverlayComponent extends HTMLElement {
  updateModel(semanticModel: SemanticModel) {
    this.innerHTML = modelToOverlayHtml(semanticModel);
  }

  updateScroll(referenceDom: HTMLElement) {
    this.scrollTop = referenceDom.scrollTop;
    this.scrollLeft = referenceDom.scrollLeft;
  }
}
