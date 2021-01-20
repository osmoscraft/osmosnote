import { moveElementToLeft, moveElementToRight } from "./mutation.js";

export function renderDefaultCursor() {
  const lines = document.querySelectorAll("[data-line]");

  if (lines.length) {
    const cursorStart = document.createElement("span");
    const cursorEnd = document.createElement("span");
    cursorStart.classList.add("cursor", "cursor--start");
    cursorEnd.classList.add("cursor", "cursor--end");
    lines[0].prepend(cursorEnd);
    lines[0].prepend(cursorStart);
  }
}

/**
 * @param {Node} root
 */
export function cursorRight(root) {
  const { start, end } = getBracket();

  // TODO, cannot assume start is before end
  if (isCollapsed(start, end)) {
    moveElementToRight(end, root);
    moveElementToRight(start, root);
  }
}

/**
 * @param {Node} root
 */
export function cursorLeft(root) {
  const { start, end } = getBracket();

  // TODO, cannot assume start is before end
  if (isCollapsed(start, end)) {
    moveElementToLeft(start, root);
    moveElementToLeft(end, root);
  }
}

/**
 *
 * @param {HTMLElement} start
 * @param {HTMLElement} end
 */
function isCollapsed(start, end) {
  return start.nextElementSibling === end;
}

function getBracket() {
  const start = document.querySelector(".cursor--start");
  const end = document.querySelector(".cursor--end");
  return {
    start,
    end,
  };
}
