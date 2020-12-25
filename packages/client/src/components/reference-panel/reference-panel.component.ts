import type { IncomingConnection } from "@system-two/server/src/routes/note";
import "./reference-panel.css";

export class ReferencePanelComponent extends HTMLElement {
  listDom!: HTMLUListElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<ul id="refpnl-list" class="refpnl-list"></ul>`;

    this.listDom = this.querySelector("#refpnl-list") as HTMLUListElement;
  }

  setIncomingConnections(notes: IncomingConnection[]) {
    this.listDom.innerHTML = notes
      .map(
        (note) => /*html*/ `
    <li>
      <a class="refpnl-link" href="/?filename=${note.filename}">${note.title}</a>
    </li>
    `
      )
      .join("");
  }
}
