import type { ComponentRefService } from "../../services/component-reference/component-ref.service.js";
import { getCursorFromDom } from "./helpers/curosr/cursor-query.js";
import { clearCursorInDom, showCursorInDom, updateCursorInDom } from "./helpers/curosr/cursor-select.js";

export class CaretService {
  constructor(private componentRef: ComponentRefService) {}

  updateModelFromDom() {
    const host = this.componentRef.textEditor.host;

    clearCursorInDom(host);
    const cursor = getCursorFromDom();
    if (cursor) {
      showCursorInDom(cursor, host);
    }
  }

  updateDomFromModel() {
    // TBD
  }
}
