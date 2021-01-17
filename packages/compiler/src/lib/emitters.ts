import type { Emitter } from "../emit";
import type { Node } from "../parse";

const headingLineEmitter: Emitter = {
  emit: (node: Node) => {
    return /*html*/ `<div>${node.data?.headingHashes} ${node.data?.titleText}</div>`;
  },
};

const metaLineEmitter: Emitter = {
  emit: (node: Node) => {
    return /*html*/ `<div>#+${node.data?.metaKey}: ${node.data?.metaValue}</div>`;
  },
};

const blankLineEmitter: Emitter = {
  emit: (node: Node) => {
    return /*html*/ `<div><br></div>`;
  },
};

const paragraphLineEmitter: Emitter = {
  emit: (node: Node, children: string = "") => {
    return /*html*/ `<div>${children}</div>`;
  },
};

const textInlineEmitter: Emitter = {
  emit: (node: Node) => {
    return node.value!;
  },
};

const linkInlineEmitter: Emitter = {
  emit: (node: Node) => {
    return node.value!;
  },
};

export const emitters = new Map<string, Emitter>([
  ["HeadingLine", headingLineEmitter],
  ["MetaLine", metaLineEmitter],
  ["BlankLine", blankLineEmitter],
  ["ParagraphLine", paragraphLineEmitter],
  ["TextInline", textInlineEmitter],
  ["LinkInline", linkInlineEmitter],
]);
