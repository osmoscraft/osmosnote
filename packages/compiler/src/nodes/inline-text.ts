import type { LiteralNode, LiteralSchema } from "../schema/schema";

export interface InlineTextNode extends LiteralNode<InlineTextNodeSchema> {}

export interface InlineTextNodeSchema extends LiteralSchema {
  type: "InlineText";
}

export const inlineTextSchema: InlineTextNodeSchema = {
  type: "InlineText",
  pattern: /.*/,
  onAfterVisit: (node, match) => {
    node.value = match[0];
  },
};
