import type { ASTNode, BaseNodeSchema } from "../schema/schema";

export interface LineMetaNode extends ASTNode<LineMetaNodeSchema> {}

export interface LineMetaNodeSchema extends BaseNodeSchema<LineMetaNodeData> {
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
