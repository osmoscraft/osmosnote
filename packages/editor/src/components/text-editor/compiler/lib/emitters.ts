import type { Emitter } from "../emit";
import type { Node } from "@system-two/compiler";

const headingLineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return /*html*/ `<div data-path="${path}">${node.data?.headingHashes} ${node.data?.titleText}</div>`;
  },
};

const metaLineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return /*html*/ `<div data-path="${path}">#+${node.data?.metaKey}: ${node.data?.metaValue}</div>`;
  },
};

const blankLineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return /*html*/ `<div data-path="${path}"><br></div>`;
  },
};

const paragraphLineEmitter: Emitter = {
  emit: (node: Node, path: string, children: string = "") => {
    return /*html*/ `<div data-path="${path}">${children}</div>`;
  },
};

const textInlineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return node.value!;
  },
};

const linkInlineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
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
