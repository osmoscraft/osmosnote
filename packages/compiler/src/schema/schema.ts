export interface LiteralSchema<T = any> extends Schema {
  onAfterVisit?: (node: LiteralNode<LiteralSchema<T>>, match: RegExpMatchArray) => void;
}

export interface ParentSchema<T = any> extends Schema {
  children: Schema[];
  onAfterVisit?: (node: ParentNode<ParentSchema<T>>, match: RegExpMatchArray) => void;
}

export interface Schema {
  type: string;
  pattern: RegExp;
}

export interface LiteralNode<T extends LiteralSchema = LiteralSchema> extends Node<T> {
  value: string;
}

export interface ParentNode<T extends ParentSchema = ParentSchema> extends Node<T> {
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

type SchemaToNodeData<T extends Schema> = T extends ParentSchema<infer U>
  ? U
  : T extends LiteralSchema<infer U>
  ? U
  : never;

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
