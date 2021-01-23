/**
 * Given the current node and an offset, find a target node
 * and an offset relative to the beginning of that node.
 */
export function getTextNodeByOffset(sourceNode: Node, offset: number, rootNode?: Node) {
  let targetNode = null;
  let targetOffset = null;
  let remainingDistance = Math.abs(offset);
  let currentNode;

  const onVisit = (node: Node) => {
    if (isTextNode(node)) {
      if (node.length >= remainingDistance) {
        return true;
      } else {
        remainingDistance = remainingDistance - node.length;
      }
    }
  };

  if (offset > 0) {
    currentNode = getClosestNextNode(sourceNode, rootNode);

    while (currentNode && remainingDistance) {
      const foundNode = depthVisitLeafNodesForward(currentNode, onVisit);
      if (foundNode) {
        targetNode = foundNode as Text;
        targetOffset = remainingDistance;
        break;
      } else if (currentNode === rootNode) {
        break;
      } else {
        currentNode = currentNode.nextSibling ?? currentNode.parentNode;
      }
    }
  } else if (offset < 0) {
    currentNode = getClosestPreviousNode(sourceNode, rootNode);

    while (currentNode && remainingDistance) {
      const foundNode = depthVisitLeafNodesBackward(currentNode, onVisit);
      if (foundNode) {
        targetNode = foundNode as Text;
        targetOffset = targetNode.length - remainingDistance;
        break;
      } else if (currentNode === rootNode) {
        break;
      } else {
        currentNode = currentNode.previousSibling ?? currentNode.parentNode;
      }
    }
  } else {
    throw new Error("Find within self is not implemented");
  }

  return {
    node: targetNode,
    offset: targetOffset,
  };
}

export function depthVisitLeafNodesForward(node: Node, onVisit: (node: Node) => void | true): Node | null {
  if (!node.hasChildNodes()) {
    if (onVisit(node)) return node;
  } else if (node.hasChildNodes()) {
    const foundNode = depthVisitLeafNodesForward(node.firstChild!, onVisit);
    if (foundNode) return foundNode;
  } else if (node.nextSibling) {
    const foundNode = depthVisitLeafNodesForward(node.nextSibling, onVisit);
    if (foundNode) return foundNode;
  }

  return null;
}
export function depthVisitLeafNodesBackward(node: Node, onVisit: (node: Node) => void | true): Node | null {
  if (!node.hasChildNodes()) {
    if (onVisit(node)) return node;
  } else if (node.hasChildNodes()) {
    const foundNode = depthVisitLeafNodesBackward(node.lastChild!, onVisit);
    if (foundNode) return foundNode;
  } else if (node.previousSibling) {
    const foundNode = depthVisitLeafNodesBackward(node.previousSibling, onVisit);
    if (foundNode) return foundNode;
  }

  return null;
}

/**
 * Get next sibling from the current node or from a nearest parent
 */
export function getClosestNextNode(sourceNode: Node | null, rootNode?: Node): Node | null {
  if (!sourceNode) return null;
  if (sourceNode === rootNode) return null;

  if (sourceNode.nextSibling) {
    return sourceNode.nextSibling;
  } else {
    return getClosestNextNode(sourceNode.parentNode, rootNode);
  }
}

/**
 * Get next sibling from the current node or from a nearest parent
 */
export function getClosestPreviousNode(sourceNode: Node | null, rootNode?: Node): Node | null {
  if (!sourceNode) return null;
  if (sourceNode === rootNode) return null;

  if (sourceNode.previousSibling) {
    return sourceNode.previousSibling;
  } else {
    return getClosestPreviousNode(sourceNode.parentNode, rootNode);
  }
}

export function isTextNode(node: Node | null): node is Text {
  return node?.nodeType === Node.TEXT_NODE;
}

export function moveToTextNode(sourceNode: Node, targetNode: Text, targetOffset = 0) {
  if (sourceNode.previousSibling === targetNode) {
    // transfer text from prev sibling to next
    const cutText = cutTextAfter(targetNode, targetOffset);
    appendOuterText(sourceNode, cutText);
  } else if (sourceNode.nextSibling === targetNode) {
    // transfer text from next sibling to prev
    const cutText = cutTextBefore(targetNode, targetOffset);
    insertOuterText(sourceNode, cutText);
  } else {
    // source and target are not adjacent
    const targetParent = targetNode.parentNode!;
    const nodeToMove = removeFromTextNode(sourceNode);

    if (targetOffset === 0) {
      targetParent.insertBefore(nodeToMove, targetNode);
    } else if (targetOffset === targetNode.length) {
      targetParent.insertBefore(nodeToMove, null);
    } else {
      const remainder = targetNode.splitText(targetOffset);
      targetParent.insertBefore(nodeToMove, remainder);
    }
  }
}

export function removeFromTextNode(sourceNode: Node): Node {
  const nodeBefore = sourceNode.previousSibling;
  const nodeNext = sourceNode.nextSibling;
  sourceNode.parentNode!.removeChild(sourceNode);

  // join the remaining text
  if (isTextNode(nodeBefore) && isTextNode(nodeNext)) {
    nodeBefore.appendData(nodeNext.data ?? "");
    nodeBefore.parentNode!.removeChild(nodeNext);
  }

  return sourceNode;
}

export function cutTextAfter(node: Text, offset: number): string {
  const cutLength = node.length - offset;
  const cutText = node.substringData(offset, cutLength);
  node.deleteData(offset, cutLength);
  removeIfEmpty(node);

  return cutText;
}

export function cutTextBefore(node: Text, offset: number): string {
  const cutText = node.substringData(0, offset);
  node.deleteData(0, offset);
  removeIfEmpty(node);

  return cutText;
}

/**
 * Add text to the beginning of the next sibling Text node.
 * A Text node will be created if it doesn't exist
 * @return next sibling Text node
 */
export function appendOuterText(node: Node, text: string): Text {
  let nextTextNode = node.nextSibling;
  if (!isTextNode(nextTextNode)) {
    nextTextNode = new Text();
    node.parentNode!.insertBefore(nextTextNode, node.nextSibling); // insertAfter
  }

  (nextTextNode as Text).insertData(0, text);

  return nextTextNode as Text;
}

/**
 * Add text to the end of the previous sibling Text node.
 * A Text node will be created if it doesn't exist
 * @return previous sibling Text node
 */
export function insertOuterText(node: Node, text: string): Text {
  let prevTextNode = node.previousSibling;
  if (!isTextNode(prevTextNode)) {
    prevTextNode = new Text();
    node.parentNode!.insertBefore(prevTextNode, node);
  }

  (prevTextNode as Text).appendData(text);

  return prevTextNode as Text;
}

export function removeIfEmpty(textNode: Text): Text | null {
  if (!textNode.length) {
    textNode.remove();
    return textNode;
  } else {
    return null;
  }
}

export function lastTextNodeOf(node: Node): Text | null {
  const allLeaf = flattenToLeafNodes(node).filter((node) => node.nodeType === node.TEXT_NODE) as Text[];
  return allLeaf[allLeaf.length - 1] ?? null;
}

export function firstTextNodeOf(node: Node): Text | null {
  const allLeaf = flattenToLeafNodes(node).filter((node) => node.nodeType === node.TEXT_NODE) as Text[];
  return allLeaf[0] ?? null;
}

export function flattenToLeafNodes(root: Node) {
  const hierarchicalArray = expandRecursive(root);

  const flatArray = [hierarchicalArray].flat(Infinity) as Node[];

  return flatArray;
}

export function expandRecursive(node: Node): Node | any[] {
  if (node.childNodes.length) {
    return [...node.childNodes].map(expandRecursive);
  } else {
    return node;
  }
}
