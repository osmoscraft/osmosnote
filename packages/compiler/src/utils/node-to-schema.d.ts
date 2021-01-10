import type { ASTNode, ASTSchema } from "..";
import type { UnionToTuple } from "./union-to-tuple";

export type NodeChildToSchemaChild<T extends ASTNode> = T["child"] extends string
  ? never
  : NodeArrayToSchemaArray<T["child"] extends ASTNode[] ? T["child"] : never>;

// The order of the schema is critical. Hence converting to tuple for assertion
type NodeArrayToSchemaTuple<T extends any[]> = SchemaUnionToSchemaTuple<NodeArrayToSchemaUnion<T>>;

type NodeArrayToSchemaUnion<T extends any[]> = T extends (infer U)[]
  ? U extends ASTNode
    ? ASTSchema<U>
    : never
  : never;

type SchemaUnionToSchemaTuple<T> = UnionToTuple<T>;

type NodeArrayToSchemaArray<T extends any[]> = (T extends (infer U)[]
  ? U extends ASTNode
    ? ASTSchema<U>
    : never
  : never)[];
