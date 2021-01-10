import type { ASTNode, BaseNodeSchema } from "../schema/schema";

export interface LineEmptyNode extends ASTNode<LineEmptyNodeSchema> {}

export interface LineEmptyNodeSchema extends BaseNodeSchema<LineEmptyNodeData> {
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
