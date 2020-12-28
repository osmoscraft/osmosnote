import type { EngineModel } from "../core/engine-model";
import { modelToOverlayHtml } from "../core/helpers/model-to-overlay-html";
import "./semantic-overlay.css";

export class SemanticOverlayComponent extends HTMLElement {
  updateModel(semanticModel: EngineModel) {
    this.innerHTML = modelToOverlayHtml(semanticModel);
  }

  updateScroll(referenceDom: HTMLElement) {
    this.scrollTop = referenceDom.scrollTop;
    this.scrollLeft = referenceDom.scrollLeft;
  }
}
