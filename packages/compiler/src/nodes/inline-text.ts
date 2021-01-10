import type { ASTNode, BaseNodeSchema } from "../schema/schema";

export interface InlineTextNode extends ASTNode<InlineTextNodeSchema> {}

export interface InlineTextNodeSchema extends BaseNodeSchema<InlineTextNodeData> {
  type: "InlineText";
}

export interface InlineTextNodeData {
  value: string;
}

export const inlineTextSchema: InlineTextNodeSchema = {
  type: "InlineText",
  pattern: /.*/,
  initializeData: (node, match) => ({
    value: match[0],
  }),
};
