import type { Emitter } from "../emit";
import type { Node } from "@system-two/compiler";

const headingLineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return `${node.data?.headingHashes} ${node.data?.titleText}\n`;
  },
};

const metaLineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return `#+${node.data?.metaKey}: ${node.data?.metaValue}\n`;
  },
};

const blankLineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return `\n`;
  },
};

const paragraphLineEmitter: Emitter = {
  emit: (node: Node, path: string, children: string = "") => {
    return `${children}`; // no new line as the textInline node will include it
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

export const textEmitters = new Map<string, Emitter>([
  ["HeadingLine", headingLineEmitter],
  ["MetaLine", metaLineEmitter],
  ["BlankLine", blankLineEmitter],
  ["ParagraphLine", paragraphLineEmitter],
  ["TextInline", textInlineEmitter],
  ["LinkInline", linkInlineEmitter],
]);
