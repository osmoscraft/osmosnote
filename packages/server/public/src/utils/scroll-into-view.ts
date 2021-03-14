import { getVerticalOverflow } from "./get-overflow.js";

/**
 * Scroll into view an snap to top of bottom edge of the container based on which direction the element came from
 */
export function scrollIntoView(target: HTMLElement, container = target.parentElement) {
  if (!container) return;

  const overflow = getVerticalOverflow(target, container);
  // Consider alternative:
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded

  if (overflow === "bottom") {
    target.scrollIntoView(false);
  } else if (overflow === "top") {
    target.scrollIntoView();
  }
}
