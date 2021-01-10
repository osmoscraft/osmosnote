import type { ASTNode, BaseNodeSchema } from "../schema/schema";

export interface InlineLinkNode extends ASTNode<InlineLinkNodeSchema> {}

export interface InlineLinkNodeSchema extends BaseNodeSchema {
  type: "InlineLink";
}

export const inlineLinkSchema: InlineLinkNodeSchema = {
  type: "InlineLink",
  pattern: /\[.+?\]\(.+?\)/,
};
