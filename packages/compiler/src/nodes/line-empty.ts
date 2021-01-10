import type { LiteralNode, LiteralSchema } from "../schema/schema";

export interface LineEmptyNode extends LiteralNode<LineEmptyNodeSchema> {}

export interface LineEmptyNodeSchema extends LiteralSchema<LineEmptyNodeData> {
  type: "LineEmpty";
}

export interface LineEmptyNodeData {
  value: string;
}

export const lineEmptySchema: LineEmptyNodeSchema = {
  type: "LineEmpty",
  pattern: /^\n/,
  initializeData: (node, match) => ({
    value: match[0],
  }),
};
