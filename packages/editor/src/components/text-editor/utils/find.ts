import type { Node, Point } from "@system-two/compiler";
import { isPointInPosition } from "./position";

/** Find the nearest node that contains a point */
export function findNodeAtPoint(nodes: Node[], point: Point): Node | null {
  return findRecursive(nodes, point);
}

function findRecursive(nodes: Node[], point: Point): Node | null {
  for (let node of nodes) {
    if (isPointInPosition(point, node.position)) {
      if (node.children) {
        const foundChild = findRecursive(node.children, point);
        return foundChild ?? node;
      } else {
        return node;
      }
    }
  }

  return null;
}
