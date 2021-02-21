import { createState } from "../../../utils/global-state-factory.js";

export function calculateMeasure(host: HTMLElement) {
  const [lower, upper] = getLineMeasureBounds(host);
  return getLineMeasureRecursive(host, lower, upper);
}

export const [getMeasure, setMeasure] = createState<number>(Infinity);

function getLineMeasureBounds(host: HTMLElement): [lower: number, upper: number] {
  let lowerBound = 1,
    upperBound: number;
  let currentLength = 1;
  while (getLineCount(host, currentLength) < 2) {
    lowerBound = currentLength;
    currentLength *= 2;
  }
  upperBound = currentLength;

  return [lowerBound, upperBound];
}

function getLineMeasureRecursive(host: HTMLElement, lower: number, upper: number): number {
  const diff = upper - lower;
  if (diff === 1) {
    return lower;
  }

  const mid = lower + Math.round(diff / 2);
  if (getLineCount(host, mid) === 1) {
    return getLineMeasureRecursive(host, mid, upper);
  } else {
    return getLineMeasureRecursive(host, lower, mid);
  }
}

function getLineCount(host: HTMLElement, contentLength: number): number {
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
