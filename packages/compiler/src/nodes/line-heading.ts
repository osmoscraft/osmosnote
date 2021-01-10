import type { ASTNode, BaseNodeSchema } from "../schema/schema";

export interface LineHeadingNode extends ASTNode<LineHeadingNodeSchema> {}

export interface LineHeadingNodeSchema extends BaseNodeSchema<LineHeadingNodeData> {
  type: "LineHeading";
}

export interface LineHeadingNodeData {
  value: string;
  indentWidth: number;
  sectionLevel: number;
}

export const lineHeadingSchema: LineHeadingNodeSchema = {
  type: "LineHeading",
  pattern: /^(\s*)#+ .*\n?/,
  initializeData: (node, match) => ({
    value: "",
    indentWidth: match[1].length,
    sectionLevel: 0,
  }),
};
