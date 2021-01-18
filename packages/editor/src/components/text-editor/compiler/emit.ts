import { htmlEmitters } from "./lib/html-emitters";
import type { Node } from "@system-two/compiler";
import { textEmitters } from "./lib/text-emitters";

export function astToHtml(nodes: Node[]): string {
  console.log(nodes);
  return emitRecursive(nodes, [], htmlEmitters);
}

export function astToText(nodes: Node[]): string {
  return emitRecursive(nodes, [], textEmitters);
}

function emitRecursive(nodes: Node[], path: string[], emitters: Map<string, Emitter>): string {
  let result = "";

  nodes.forEach((node, index) => {
    const type = node.type;
    const emitter = emitters.get(type);

    path.push(index.toString());
    const pathString = path.join("-");

    if (emitter) {
      result += emitter?.emit?.(node, pathString, node.children ? emitRecursive(node.children, path, emitters) : "");
    } else if (node.children) {
      result += emitRecursive(node.children, path, emitters);
    }

    path.pop();
  });

  return result;
}

export interface Emitter {
  emit?(node: Node, treePath: string, children?: string): string;
}
