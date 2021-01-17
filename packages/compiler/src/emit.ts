import { emitters } from "./lib/emitters";
import type { Node } from "./parse";

export function astToHtml(nodes: Node[]): string {
  return emitRecursive(nodes);
}

function emitRecursive(nodes: Node[]): string {
  let result = "";

  for (let node of nodes) {
    const type = node.type;
    const emitter = emitters.get(type);

    if (emitter) {
      result += emitter?.emit?.(node, node.children ? emitRecursive(node.children) : "");
    } else if (node.children) {
      result += emitRecursive(node.children);
    }
  }

  return result;
}

export interface Emitter {
  emit?(node: Node, children?: string): string;
}
