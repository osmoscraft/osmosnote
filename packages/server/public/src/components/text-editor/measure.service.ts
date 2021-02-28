import type { WindowRefService } from "../../services/window-reference/window.service";

export class MeasureService {
  private _measure: number = Infinity;

  constructor(private windowRef: WindowRefService) {}

  get measure(): number {
    return this._measure;
  }

  init(host: HTMLElement) {
    this.windowRef.window.addEventListener("resize", () => this.updateMeausre(host));
    this.updateMeausre(host);
  }

  private updateMeausre(host: HTMLElement) {
    const measure = this.calculateMeasure(host);
    this._measure = measure;
  }

  private calculateMeasure(host: HTMLElement) {
    const [lower, upper] = this.getLineMeasureBounds(host);
    return this.getLineMeasureRecursive(host, lower, upper);
  }

  private getLineMeasureBounds(host: HTMLElement): [lower: number, upper: number] {
    let lowerBound = 1,
      upperBound: number;
    let currentLength = 1;
    while (this.getLineCount(host, currentLength) < 2) {
      lowerBound = currentLength;
      currentLength *= 2;
    }
    upperBound = currentLength;

    return [lowerBound, upperBound];
  }

  private getLineMeasureRecursive(host: HTMLElement, lower: number, upper: number): number {
    const diff = upper - lower;
    if (diff === 1) {
      return lower;
    }

    const mid = lower + Math.round(diff / 2);
    if (this.getLineCount(host, mid) === 1) {
      return this.getLineMeasureRecursive(host, mid, upper);
    } else {
      return this.getLineMeasureRecursive(host, lower, mid);
    }
  }

  private getLineCount(host: HTMLElement, contentLength: number): number {
    const probeString = "m".repeat(contentLength);
    const probeContainer = document.createElement("div");
    probeContainer.dataset.measurableLine = ""; // Must get same css as the real ine
    const probeElement = document.createElement("span");
    probeElement.innerHTML = probeString;
    probeElement.style.wordBreak = "break-all";
    probeContainer.appendChild(probeElement);

    host.appendChild(probeContainer);
    const lineCount = probeElement.getClientRects().length;
    probeContainer.remove();
    return lineCount;
  }
}
