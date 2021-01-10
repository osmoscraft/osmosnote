import type { ParentNode, ParentSchema } from "../schema/schema";
import { InlineLinkNodeSchema, inlineLinkSchema } from "./inline-link";
import { InlineTextNodeSchema, inlineTextSchema } from "./inline-text";

export interface LineParagraphNode extends ParentNode<LineParagraphNodeSchema> {}

export interface LineParagraphNodeSchema extends ParentSchema {
  type: "LineParagraph";
  children: [InlineLinkNodeSchema, InlineTextNodeSchema];
}

export const lineParagraphSchema: LineParagraphNodeSchema = {
  type: "LineParagraph",
  pattern: /^.*\n?/,
  children: [inlineLinkSchema, inlineTextSchema],
};
