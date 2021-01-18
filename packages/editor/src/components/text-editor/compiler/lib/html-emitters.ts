import type { Emitter } from "../emit";
import type { Node } from "@system-two/compiler";

const headingLineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return /*html*/ `<div class="ln" data-path="${path}" ${indent(node.data!.indent!)}>${node.data?.headingHashes} ${
      node.data?.titleText
    }</div>`;
  },
};

const metaLineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return /*html*/ `<div class="ln" data-path="${path}">#+${node.data?.metaKey}: ${node.data?.metaValue}</div>`;
  },
};

const blankLineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return /*html*/ `<div class="ln" data-path="${path}" ${indent(node.data!.indent!)}><br></div>`;
  },
};

const paragraphLineEmitter: Emitter = {
  emit: (node: Node, path: string, children: string = "") => {
    return /*html*/ `<div class="ln" data-path="${path}" ${indent(node.data!.indent!)}>${children}</div>`;
  },
};

const textInlineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return /*html*/ `<span data-path="${path}">${node.value}</span>`;
  },
};

const linkInlineEmitter: Emitter = {
  emit: (node: Node, path: string) => {
    return /*html*/ `<a data-path="${path}" href="javascript:void(0)">${node.value!}</a>`;
  },
};

export const htmlEmitters = new Map<string, Emitter>([
  ["HeadingLine", headingLineEmitter],
  ["MetaLine", metaLineEmitter],
  ["BlankLine", blankLineEmitter],
  ["ParagraphLine", paragraphLineEmitter],
  ["TextInline", textInlineEmitter],
  ["LinkInline", linkInlineEmitter],
]);

function indent(size: number): string {
  return `style="padding-left: ${size * 8}px"`;
}
