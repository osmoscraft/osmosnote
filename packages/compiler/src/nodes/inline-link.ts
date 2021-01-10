import type { LiteralNode, LiteralSchema } from "../schema/schema";

export interface InlineLinkNode extends LiteralNode<InlineLinkNodeSchema> {}

export interface InlineLinkNodeSchema extends LiteralSchema {
  type: "InlineLink";
}

export const inlineLinkSchema: InlineLinkNodeSchema = {
  type: "InlineLink",
  pattern: /\[.+?\]\(.+?\)/,
};
