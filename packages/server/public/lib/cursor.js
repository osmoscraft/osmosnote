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

// TODO render collapsed cursor as a single div element

/**
 * @param {Node} root
 */
export function cursorRight(root) {
  const cursorBracket = getCursorBracket();

  if (isCollapsed(...cursorBracket)) {
    const handle = document.createElement("div");
    cursorBracket[0].parentNode.insertBefore(handle, cursorBracket[0]);

    for (let cursor of cursorBracket) {
      handle.appendChild(cursor);
    }

    moveElementToRight(handle, root);

    for (let cursor of cursorBracket) {
      handle.parentNode.insertBefore(cursor, handle);
    }

    handle.remove();
  }
}

/**
 * @param {Node} root
 */
export function cursorLeft(root) {
  const cursorBracket = getCursorBracket();

  if (isCollapsed(...cursorBracket)) {
    const handle = document.createElement("div");
    cursorBracket[0].parentNode.insertBefore(handle, cursorBracket[0]);

    for (let cursor of cursorBracket) {
      handle.appendChild(cursor);
    }

    moveElementToLeft(handle, root);

    for (let cursor of cursorBracket) {
      handle.parentNode.insertBefore(cursor, handle);
    }

    handle.remove();
  }
}

/**
 *
 * @param {HTMLElement} left
 * @param {HTMLElement} right
 */
function isCollapsed(left, right) {
  return left.nextElementSibling === right;
}

function getCursorBracket() {
  const cursors = [...document.querySelectorAll(".cursor")];
  return cursors;
}
