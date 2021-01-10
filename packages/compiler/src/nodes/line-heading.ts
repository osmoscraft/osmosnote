import type { LiteralNode, LiteralSchema } from "../schema/schema";

export interface LineHeadingNode extends LiteralNode<LineHeadingNodeSchema> {}

export interface LineHeadingNodeSchema extends LiteralSchema<LineHeadingNodeData> {
  type: "LineHeading";
}

export interface LineHeadingNodeData {
  indentWidth: number;
  sectionLevel: number;
}

export const lineHeadingSchema: LineHeadingNodeSchema = {
  type: "LineHeading",
  pattern: /^(\s*)#+ .*\n?/,
  onAfterVisit: (node, match) => {
    node.value = match[0];
    node.data = {
      indentWidth: match[1].length,
      sectionLevel: 0,
    };
  },
};
