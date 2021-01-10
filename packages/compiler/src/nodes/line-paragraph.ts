import type { ASTNode, BaseNodeSchema } from "../schema/schema";
import { InlineLinkNodeSchema, inlineLinkSchema } from "./inline-link";
import { InlineTextNodeSchema, inlineTextSchema } from "./inline-text";

export interface LineParagraphNode extends ASTNode<LineParagraphNodeSchema> {}

export interface LineParagraphNodeSchema extends BaseNodeSchema {
  type: "LineParagraph";
  childSchemas: [InlineLinkNodeSchema, InlineTextNodeSchema];
}

export const lineParagraphSchema: LineParagraphNodeSchema = {
  type: "LineParagraph",
  pattern: /^.*\n?/,
  childSchemas: [inlineLinkSchema, inlineTextSchema],
};
