import type { LiteralNode, LiteralSchema } from "../schema/schema";

export interface LineMetaNode extends LiteralNode<LineMetaNodeSchema> {}

export interface LineMetaNodeSchema extends LiteralSchema<LineMetaNodeData> {
  type: "LineMeta";
}

export interface LineMetaNodeData {
  value: string;
}

export const lineMetaSchema: LineMetaNodeSchema = {
  type: "LineMeta",
  pattern: /^#\+.+?: .*\n?/,
  initializeData: (node, match) => ({
    value: match[0],
  }),
};
