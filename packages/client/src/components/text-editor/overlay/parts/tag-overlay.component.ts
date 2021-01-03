import { TAG_SEPARATOR } from "@system-two/server/src/lib/tag";
import "./tag-overlay.css";
const _ = TAG_SEPARATOR;

export class TagOverlayComponent extends HTMLElement {
  readonly dataset!: {
    tag: string;
  };

  connectedCallback() {
    this.innerHTML = /*html*/ `<code class="s2-tag-overlay__symbol">${_}</code><code class="s2-tag-overlay__phrase">${this.dataset.tag}</code><code class="s2-tag-overlay__symbol">${_}</code>`;
  }
}
