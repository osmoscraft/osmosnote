import "./tag-overlay.css";

export class TagOverlayComponent extends HTMLElement {
  readonly dataset!: {
    raw: string;
  };

  connectedCallback() {
    const phrases = this.dataset.raw.split(":");

    this.innerHTML = phrases
      .map((phrase) => /*html*/ `<code class="s2-tag-overlay__phrase">${phrase}</code>`)
      .join(/*html*/ `<code class="s2-tag-overlay__symbol">:</code>`);
  }
}
