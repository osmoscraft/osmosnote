import { firstLeafOf, flattenToLeafNodes, lastLeafOf } from "./tree.js";

/**
 * @param {HTMLElement} element
 * @param {HTMLElement} root
 */
export function moveElementToRight(element, root) {
  const lastLeafOfElement = lastLeafOf(element);

  const allLeafNodes = flattenToLeafNodes(root);

  let currentIndex = allLeafNodes.indexOf(lastLeafOfElement);

  const nextTextNode = allLeafNodes.slice(currentIndex + 1).filter((n) => n.nodeType === 3 && n.length)[0];

  let charToMove;
  if (nextTextNode) {
    charToMove = nextTextNode.textContent[0];
    nextTextNode.textContent = nextTextNode.textContent.slice(1);

    nextTextNode.parentNode.insertBefore(element, nextTextNode);

    if (!nextTextNode.textContent) {
      nextTextNode.parentNode.removeChild(nextTextNode);
    }
  } else {
    return;
  }

  const prevNode = element.previousSibling;
  if (prevNode?.nodeType === 3) {
    prevNode.textContent = prevNode.textContent.concat(charToMove);
  } else {
    element.parentNode.insertBefore(new Text(charToMove), element);
  }
}

/**
 * @param {HTMLElement} element
 * @param {HTMLElement} root
 */
export function moveElementToLeft(element, root) {
  const firstLeafOfElement = firstLeafOf(element);

  const allLeafNodes = flattenToLeafNodes(root);

  let currentIndex = allLeafNodes.indexOf(firstLeafOfElement);

  const prevTextNodes = allLeafNodes.slice(0, currentIndex).filter((n) => n.nodeType === 3 && n.length);

  let charToMove;
  if (prevTextNodes.length) {
    const prevTextNode = prevTextNodes[prevTextNodes.length - 1];
    if (!prevTextNode.length) {
      return; // head of document
    }

    charToMove = prevTextNode.textContent[prevTextNode.length - 1];
    prevTextNode.textContent = prevTextNode.textContent.slice(0, -1);

    prevTextNode.parentNode.insertBefore(element, prevTextNode.nextSibling);

    if (!prevTextNode.textContent) {
      prevTextNode.parentNode.removeChild(prevTextNode);
    }
  } else {
    return; // head of document
  }

  const nextNode = element.nextSibling;
  if (nextNode?.nodeType === 3) {
    nextNode.textContent = charToMove.concat(nextNode.textContent);
  } else {
    element.parentNode.insertBefore(new Text(charToMove), element.nextSibling);
  }
}
