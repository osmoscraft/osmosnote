import "./tag-overlay.css";

export class TagOverlayComponent extends HTMLElement {
  readonly dataset!: {
    tag: string;
  };

  connectedCallback() {
    this.innerHTML = /*html*/ `<code class="s2-tag-overlay__symbol">:</code><code class="s2-tag-overlay__phrase">${this.dataset.tag}</code><code class="s2-tag-overlay__symbol">:</code>`;
  }
}
