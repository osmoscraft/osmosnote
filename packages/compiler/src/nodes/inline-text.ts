import type { LiteralNode, LiteralSchema } from "../schema/schema";

export interface InlineTextNode extends LiteralNode<InlineTextNodeSchema> {}

export interface InlineTextNodeSchema extends LiteralSchema<InlineTextNodeData> {
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
