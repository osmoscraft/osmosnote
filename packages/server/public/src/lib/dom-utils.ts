export interface SeekInput {
  source: Node;
  offset?: number;
  seek?: number;
  root?: Node | null;
}

export interface SeekOutput {
  node: Text;
  offset: number;
}

export function seek(input: SeekInput): SeekOutput | null {
  const { source, offset = 0, seek = 0, root = null } = input;

  let targetNode = null;
  let targetOffset = null;
  let currentNode: Node | null = source;
  const offsetFromSourceNodeStartEdge = offset + seek;
  let remainingDistance = Math.abs(offsetFromSourceNodeStartEdge);

  const onVisit = (node: Node) => {
    if (isTextNode(node)) {
      if (node.length >= remainingDistance) {
        return true;
      } else {
        remainingDistance = remainingDistance - node.length;
      }
    }
  };

  if (offsetFromSourceNodeStartEdge >= 0) {
    while (currentNode && !targetNode) {
      const foundNode = depthVisitLeafNodesForward(currentNode, onVisit);
      if (foundNode) {
        targetNode = foundNode as Text;
        targetOffset = remainingDistance;
        break;
      } else if (currentNode === root) {
        break;
      } else {
        currentNode = getClosestNextNode(source, root);
      }
    }
  } else {
    currentNode = getClosestPreviousNode(source, root);

    while (currentNode && !targetNode) {
      const foundNode = depthVisitLeafNodesBackward(currentNode, onVisit);
      if (foundNode) {
        targetNode = foundNode as Text;
        targetOffset = targetNode.length - remainingDistance;
        break;
      } else if (currentNode === root) {
        break;
      } else {
        currentNode = getClosestPreviousNode(source, root);
      }
    }
  }

  if (targetNode) {
    return {
      node: targetNode,
      offset: targetOffset!,
    };
  } else {
    return null;
  }
}

export interface SeekOuterInput {
  source: Node;
  seek: number;
  root?: Node | null;
}

/**
 * From the start/end edge of a node, find a position using the given offset.
 * When seek is +0 or positive, seek forward from the end edge of the node
 * Week seek is -0 or negative, seek backward from the start edge of the node
 */
export function seekOuter(input: SeekOuterInput): SeekOutput | null {
  const { source, seek, root = null } = input;

  let targetNode = null;
  let targetOffset = null;
  let currentNode: Node | null = source;
  const offsetFromSoureNodeEdge = seek;
  let remainingDistance = Math.abs(offsetFromSoureNodeEdge);

  const onVisit = (node: Node) => {
    if (isTextNode(node)) {
      if (node.length >= remainingDistance) {
        return true;
      } else {
        remainingDistance = remainingDistance - node.length;
      }
    }
  };

  if (offsetFromSoureNodeEdge > 0 || Object.is(offsetFromSoureNodeEdge, +0)) {
    currentNode = getClosestNextNode(source, root);

    while (currentNode && !targetNode) {
      const foundNode = depthVisitLeafNodesForward(currentNode, onVisit);
      if (foundNode) {
        targetNode = foundNode as Text;
        targetOffset = remainingDistance;
        break;
      } else if (currentNode === root) {
        break;
      } else {
        currentNode = getClosestNextNode(source, root);
      }
    }
  } else if (offsetFromSoureNodeEdge < 0 || Object.is(offsetFromSoureNodeEdge, -0)) {
    currentNode = getClosestPreviousNode(source, root);

    while (currentNode && !targetNode) {
      const foundNode = depthVisitLeafNodesBackward(currentNode, onVisit);
      if (foundNode) {
        targetNode = foundNode as Text;
        targetOffset = targetNode.length - remainingDistance;
        break;
      } else if (currentNode === root) {
        break;
      } else {
        currentNode = getClosestPreviousNode(source, root);
      }
    }
  } else {
    throw new Error("Unexpected offset");
  }

  if (targetNode) {
    return {
      node: targetNode,
      offset: targetOffset!,
    };
  } else {
    return null;
  }
}

/**
 * @param onVisit return `true` to stop visiting more nodes
 */
export function depthVisitLeafNodesForward(node: Node, onVisit: (node: Node) => void | true): Node | null {
  if (!node.hasChildNodes()) {
    if (onVisit(node)) return node;
  } else {
    // search child
    let foundNode = depthVisitLeafNodesForward(node.firstChild!, onVisit);
    if (foundNode) return foundNode;
  }

  // search sibling
  if (node.nextSibling) {
    const foundNode = depthVisitLeafNodesForward(node.nextSibling, onVisit);
    if (foundNode) return foundNode;
  }

  return null;
}

/**
 * @param onVisit return `true` to stop visiting more nodes
 */
export function depthVisitLeafNodesBackward(node: Node, onVisit: (node: Node) => void | true): Node | null {
  if (!node.hasChildNodes()) {
    if (onVisit(node)) return node;
  } else {
    // search child
    const foundNode = depthVisitLeafNodesBackward(node.lastChild!, onVisit);
    if (foundNode) return foundNode;
  }

  // search sibling
  if (node.previousSibling) {
    const foundNode = depthVisitLeafNodesBackward(node.previousSibling, onVisit);
    if (foundNode) return foundNode;
  }

  return null;
}

/**
 * Get next sibling from the current node or from a nearest parent
 */
export function getClosestNextNode(sourceNode: Node | null, rootNode?: Node | null): Node | null {
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
export function getClosestPreviousNode(sourceNode: Node | null, rootNode?: Node | null): Node | null {
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
function appendOuterText(node: Node, text: string): Text {
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
function insertOuterText(node: Node, text: string): Text {
  let prevTextNode = node.previousSibling;
  if (!isTextNode(prevTextNode)) {
    prevTextNode = new Text();
    node.parentNode!.insertBefore(prevTextNode, node);
  }

  (prevTextNode as Text).appendData(text);

  return prevTextNode as Text;
}

function removeIfEmpty(textNode: Text): Text | null {
  if (!textNode.length) {
    textNode.remove();
    return textNode;
  } else {
    return null;
  }
}

export function lastInnerTextNode(node: Node): Text | null {
  return lastInnerLeafNode(node, (node) => node.nodeType === node.TEXT_NODE) as Text | null;
}

export function firstInnerTextNode(node: Node): Text | null {
  return firstInnerLeafNode(node, (node) => node.nodeType === node.TEXT_NODE) as Text | null;
}

export function lastInnerLeafNode(node: Node, filterFn: (node: Node) => boolean = () => true): Node | null {
  const results = flattenToLeafNodes(node).filter(filterFn);
  return results[results.length - 1] ?? null;
}

export function firstInnerLeafNode(node: Node, filterFn: (node: Node) => boolean = () => true): Node | null {
  const results = flattenToLeafNodes(node).filter(filterFn);
  return results[0] ?? null;
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

export function getNodeLength(node: Node): number {
  if ((node as Text).length !== undefined) return (node as Text).length;
  if ((node as HTMLElement).innerText !== undefined) return (node as HTMLElement).innerText.length;

  throw new Error(`Unexpected node type ${node.nodeType}`);
}
