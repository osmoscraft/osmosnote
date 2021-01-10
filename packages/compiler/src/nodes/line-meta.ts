import type { LiteralNode, LiteralSchema } from "../schema/schema";

export interface LineMetaNode extends LiteralNode<LineMetaNodeSchema> {}

export interface LineMetaNodeSchema extends LiteralSchema {
  type: "LineMeta";
}

export const lineMetaSchema: LineMetaNodeSchema = {
  type: "LineMeta",
  pattern: /^#\+.+?: .*\n?/,
  onAfterVisit: (node, match) => {
    node.value = match[0];
  },
};
