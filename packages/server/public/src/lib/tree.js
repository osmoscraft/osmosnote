/**
 * @param {Node} root
 * @return {Array<Node>}
 */
export function flattenToLeafNodes(root) {
  const hierarchicalArray = expandRecursive(root);

  const flatArray = [hierarchicalArray].flat(Infinity);

  return flatArray;
}

/**
 *
 * @param {Node} node
 * @return {Array<any> | Node}
 */
function expandRecursive(node) {
  if (node.childNodes.length) {
    return [...node.childNodes].map(expandRecursive);
  } else {
    return node;
  }
}

/**
 * @param {Node} node
 */
export function lastLeafNodeOf(node) {
  const allLeaf = flattenToLeafNodes(node);
  return allLeaf[allLeaf.length - 1];
}

/**
 * @param {Node} node
 */
export function firstLeafNodeOf(node) {
  const allLeaf = flattenToLeafNodes(node);
  return allLeaf[0];
}
