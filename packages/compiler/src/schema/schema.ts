import type { Optional } from "../utils/type-utils";

export type BaseNodeSchema<T = any> = undefined extends T
  ? Optional<BaseNodeSchemaInternal<T>, "initializeData">
  : BaseNodeSchemaInternal<T>;

interface BaseNodeSchemaInternal<T> {
  type: string;
  pattern: RegExp;
  childSchemas?: BaseNodeSchema[];
  initializeData: (node: ASTNode<BaseNodeSchema>, match: RegExpMatchArray) => T;
}

export type ASTNode<T extends BaseNodeSchema> = undefined extends T["childSchemas"]
  ? undefined extends T["initializeData"]
    ? Omit<ASTNodeInternal<T>, "childNodes" | "data">
    : Omit<ASTNodeInternal<T>, "childNodes">
  : undefined extends T["initializeData"]
  ? Omit<ASTNodeInternal<T>, "data">
  : ASTNodeInternal<T>;

interface ASTNodeInternal<T extends BaseNodeSchema> {
  type: T["type"];
  start: number;
  end: number;
  /**
   * An array of child notes when child schemas are defined. Otherwise, it will be undefined
   */
  childNodes: SchemasToNodes<T["childSchemas"]>;
  data: SchemaToNodeData<T>;
}

type SchemaToNodeData<T extends BaseNodeSchema> = undefined extends T["initializeData"]
  ? never
  : T["initializeData"] extends (...args: any) => any
  ? ReturnType<T["initializeData"]>
  : never;

type SchemasToNodes<T extends BaseNodeSchema[] | undefined> = undefined extends T
  ? never
  : T extends BaseNodeSchema[]
  ? SchemasToNodeUnion<T>[]
  : never;

type SchemasToNodeUnion<T extends BaseNodeSchema[]> = T extends (infer U)[]
  ? U extends BaseNodeSchema
    ? ASTNode<U>
    : never
  : never;
