export class FocusTrapComponent extends HTMLElement {
  readonly dataset!: {
    position: "begin" | "end";
    disabled?: "true";
  };

  connectedCallback() {
    const peerTraps = this.parentElement?.querySelectorAll("s2-focus-trap");
    if (peerTraps?.length !== 2) {
      console.error("[focus-trap] must be used in pairs");
    } else {
      this.dataset.position = this === peerTraps[0] ? "begin" : "end";
      this.tabIndex = 0;
    }

    this.addEventListener("focus", () => {
      if (this.dataset.disabled === "true") return;

      // This is a naive selector for all focusable element, based on https://gomakethings.com/how-to-get-the-first-and-last-focusable-elements-in-the-dom/
      // A more robust version should consider disabled state: https://hiddedevries.nl/en/blog/2017-01-29-using-javascript-to-trap-focus-in-an-element
      // modifications
      // - added "summary"
      const maybeFocusableElements = [
        ...this.parentElement!.querySelectorAll(
          `button, summary, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])`
        ),
      ];

      const focusableElements = maybeFocusableElements
        .filter((e) => e.matches(":not(s2-focus-trap)")) // exclude focus trap themselves
        .filter((e) => e.matches(":not([disabled])")) // exclude anything that's disabled
        .filter((e) => e.matches(`:not([tabindex="-1"])`)) // anything with interaction intentionally disabled
        .filter((e) => e.matches("summary") || !e.closest("details:not([open])")); // exclude children of collapsed details

      if (this.dataset.position === "begin") {
        (focusableElements[focusableElements.length - 1] as HTMLElement)?.focus();
      } else if (this.dataset.position === "end") {
        (focusableElements[0] as HTMLElement)?.focus();
      }
    });
  }
}

customElements.define("s2-focus-trap", FocusTrapComponent);
