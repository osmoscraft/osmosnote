import { emitters } from "./lib/emitters";
import type { Node } from "@system-two/compiler";

export function astToHtml(nodes: Node[]): string {
  return emitRecursive(nodes, []);
}

function emitRecursive(nodes: Node[], path: string[]): string {
  let result = "";

  nodes.forEach((node, index) => {
    const type = node.type;
    const emitter = emitters.get(type);

    path.push(index.toString());
    const pathString = path.join("-");

    if (emitter) {
      result += emitter?.emit?.(node, pathString, node.children ? emitRecursive(node.children, path) : "");
    } else if (node.children) {
      result += emitRecursive(node.children, path);
    }

    path.pop();
  });

  return result;
}

export interface Emitter {
  emit?(node: Node, treePath: string, children?: string): string;
}
