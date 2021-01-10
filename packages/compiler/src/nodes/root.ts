import type { ASTNode, BaseNodeSchema } from "../schema/schema";
import { LineEmptyNodeSchema, lineEmptySchema } from "./line-empty";
import { LineHeadingNodeSchema, lineHeadingSchema } from "./line-heading";
import { LineMetaNodeSchema, lineMetaSchema } from "./line-meta";
import { LineParagraphNodeSchema, lineParagraphSchema } from "./line-paragraph";

export interface RootNode extends ASTNode<RootNodeSchema> {}

interface RootNodeSchema extends BaseNodeSchema {
  type: "root";
  childSchemas: [LineEmptyNodeSchema, LineHeadingNodeSchema, LineMetaNodeSchema, LineParagraphNodeSchema];
}

export const rootSchema: RootNodeSchema = {
  type: "root",
  pattern: /.*/, // Not used, just for completeness
  childSchemas: [lineEmptySchema, lineHeadingSchema, lineMetaSchema, lineParagraphSchema],
};
