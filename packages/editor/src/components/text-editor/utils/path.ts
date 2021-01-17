import type { Node } from "@system-two/compiler";

export function getPathStringToNode(node: Node, ast: Node[]): string {
  const pathToNode = getPathToNode(node, ast);
  if (!pathToNode) throw new Error("Node not in AST");

  return pathToNode.join("-");
}

function getPathToNode(node: Node, ast: Node[]): number[] | null {
  return getPathRecursive(node, ast);
}

function getPathRecursive(node: Node, nodes: Node[]): number[] | null {
  for (let i = 0; i < nodes.length; i++) {
    const candidateNode = nodes[i];

    if (candidateNode === node) {
      return [i];
    } else if (candidateNode.children) {
      const childPath = getPathRecursive(node, candidateNode.children);
      if (childPath) return [i, ...childPath];
    }
  }

  return null;
}
