import type { ReferenceNote } from "@system-two/server/src/routes/note";
import "./reference-panel.css";

export class ReferencePanelComponent extends HTMLElement {
  listDom!: HTMLUListElement;

  connectedCallback() {
    this.innerHTML = /*html*/ `<ul id="refpnl-list" class="refpnl-list"></ul>`;

    this.listDom = this.querySelector("#refpnl-list") as HTMLUListElement;
  }

  setAppearedInNotes(notes: ReferenceNote[]) {
    this.listDom.innerHTML = notes
      .map(
        (note) => /*html*/ `
    <li>
      <a class="refpnl-link" href="/editor.html?filename=${note.filename}">${note.title}</a>
    </li>
    `
      )
      .join("");
  }
}
