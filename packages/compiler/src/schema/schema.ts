export interface LiteralSchema<T = any> extends Schema<T> {}

export interface ParentSchema<T = any> extends Schema<T> {
  children: Schema[];
}

export interface Schema<T = any> {
  type: string;
  pattern: RegExp;
  initializeData?: (node: Node<Schema<T>>, match: RegExpMatchArray) => any;
}

export interface LiteralNode<T extends LiteralSchema<any>> extends Node<T> {
  value: any;
}

export interface ParentNode<T extends ParentSchema<any>> extends Node<T> {
  /**
   * An array of child notes when child schemas are defined. Otherwise, it will be undefined
   */
  children: SchemasToNodes<T>;
}

export interface Node<T extends Schema> {
  type: T["type"];
  start: number;
  end: number;
  data?: SchemaToNodeData<T>;
}

type SchemaToNodeData<T extends Schema> = T extends Schema<infer U> ? U : never;

type SchemasToNodes<T extends ParentSchema> = T["children"] extends Schema[]
  ? SchemasToNodeUnion<T["children"]>[]
  : never;

type SchemasToNodeUnion<T extends Schema[]> = T extends (infer U)[]
  ? U extends ParentSchema
    ? ParentNode<U>
    : U extends LiteralSchema
    ? LiteralNode<U>
    : never
  : never;
