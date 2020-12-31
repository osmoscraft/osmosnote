import type { NoteMetadata } from "@system-two/server/src/lib/parse-note";
import "./document-header.css";

export interface HeaderInitConfig {
  id?: string;
  metadata: NoteMetadata;
}

interface HeaderModel {
  expanded: boolean;
  title: string;
  metadataItems: {
    id: string;
    saveAsKey?: Extract<keyof NoteMetadata, "url">;
    name: string;
    value: string;
    readonly?: boolean;
    type: "url" | "text";
    placeholder?: string;
  }[];
}

export class DocumentHeaderComponent extends HTMLElement {
  headingInputDom!: HTMLInputElement;
  detailsDom!: HTMLDetailsElement;
  summaryDom!: HTMLElement;
  fieldsContainerDom!: HTMLElement;
  model!: HeaderModel;

  connectedCallback() {
    this.innerHTML = /*html*/ `
    <details id="document-metadata" class="dchdr-metadata">
      <summary class="dchdr-metadata__summary">Metadata</summary>
      <div id="meta-fields" class="dchdr-fields"></div>
    </details>
    <input id="heading-input" class="dchdr-heading-input">
    `;

    this.headingInputDom = this.querySelector("#heading-input") as HTMLInputElement;
    this.detailsDom = this.querySelector("details")!;
    this.summaryDom = this.querySelector("summary")!;
    this.fieldsContainerDom = this.querySelector("#meta-fields") as HTMLElement;

    this.renderSummaryText();
    this.handleEvents();
  }

  setData(config: HeaderInitConfig) {
    this.model = {
      expanded: false,
      title: config.metadata.title,
      metadataItems: [
        {
          id: "meta-field-id",
          name: "ID",
          value: config.id ?? "New",
          readonly: true,
          type: "text",
        },
        {
          id: "meta-field-url",
          name: "External URL",
          value: config.metadata.url ?? "",
          type: "url",
          saveAsKey: "url",
          placeholder: "https://www.domain.com",
        },
      ],
    };

    this.renderInitial();
  }

  getTitle(): string {
    return this.headingInputDom.value;
  }

  getData(): NoteMetadata {
    const saveableFields = this.model.metadataItems
      .filter((item) => item.saveAsKey)
      .filter((item) => item.value?.length) // empty field will be deleted
      .map((item) => [item.saveAsKey, item.value]);
    const saveableMap = Object.fromEntries(saveableFields);

    return {
      title: this.model.title,
      ...saveableMap,
    };
  }

  private handleEvents() {
    this.detailsDom.addEventListener("toggle", () => {
      this.updateModelFromHtml();

      this.renderUpdate();
    });

    this.addEventListener("keydown", (e) => {
      if (e.key === "/" && (e.target as HTMLInputElement)?.matches(`input[type="url"]`)) {
        e.stopPropagation(); // no global menu for url input box
      }
    });

    this.addEventListener("input", () => {
      this.updateModelFromHtml();

      // this step currently does nothing but it shows completes the mental model of an update lifecycle
      // it is also a sanity check to see if model is correct.
      // in the future, this call might have real effects
      this.renderUpdate();
    });
  }

  private renderInitial() {
    this.renderAccordionState();
    this.renderTitle();
    this.renderFieldsInitial();
    this.renderSummaryText();
  }

  private renderAccordionState() {
    if (this.detailsDom.open !== this.model.expanded) {
      this.detailsDom.open = this.model.expanded;
    }
  }

  private renderTitle() {
    if (this.headingInputDom.value !== this.model.title) {
      this.headingInputDom.value = this.model.title;
    }
  }

  private renderFieldsInitial() {
    this.fieldsContainerDom.innerHTML = this.model.metadataItems.map((item) => this.getFieldHtml(item)).join("");
  }

  private renderSummaryText() {
    if (this.detailsDom.open) {
      this.summaryDom.innerText = "Metadata";
    } else {
      this.summaryDom.innerText = this.getCompactSummary();
    }
  }

  private updateModelFromHtml() {
    const fields = this.querySelectorAll(".dchdr-fields input") as NodeListOf<HTMLInputElement>;

    const model = JSON.parse(JSON.stringify(this.model)) as HeaderModel;
    model.title = this.headingInputDom.value;
    model.expanded = this.detailsDom.open;

    fields.forEach((viewField) => {
      const modelField = model.metadataItems.find((item) => item.id === viewField.id);
      if (modelField) {
        modelField.value = viewField.value;
      }
    });

    this.model = model;
  }

  private renderUpdate() {
    this.renderAccordionState();
    this.renderTitle();
    this.renderFieldsUpdate();
    this.renderSummaryText();
  }

  private renderFieldsUpdate() {
    const viewFields = [...(this.querySelectorAll(".dchdr-fields input") as NodeListOf<HTMLInputElement>)];

    this.model.metadataItems.forEach((item) => {
      const viewField = viewFields.find((viewField) => viewField.id === item.id);
      if (viewField && viewField.value !== item.value) {
        viewField.value = item.value;
      }
    });
  }

  private getFieldHtml(props: {
    id: string;
    name: string;
    value: string;
    readonly?: boolean;
    type: "url" | "text";
    saveAsKey?: string;
    placeholder?: string;
  }) {
    return /*html*/ `
    <label for="${props.id}" class="dchdr-field__label">${props.name}</label>
    <input class="dchdr-field__input" id="${props.id}" type="${props.type}" value="${props.value}" placeholder="${
      props.placeholder ?? ""
    }"${props.saveAsKey ? ` data-save-as-key="${props.saveAsKey}" ` : ""}${props.readonly ? " readonly" : ""}>
    `.trim();
  }

  private getCompactSummary(): string {
    const fields = this.querySelectorAll(".dchdr-fields input") as NodeListOf<HTMLInputElement>;
    const displayString = [...fields]
      .map((field) => field.value)
      .filter((value) => !!value)
      .join(" · ");
    return displayString;
  }
}
