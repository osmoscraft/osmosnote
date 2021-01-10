// reference:
// https://github.com/microsoft/TypeScript/issues/13298
// https://stackoverflow.com/questions/55127004/how-to-transform-union-type-to-tuple-type

export type UnionToTuple<T> = (
  (T extends any ? (t: T) => T : never) extends infer U
    ? (U extends any ? (u: U) => any : never) extends (v: infer V) => any
      ? V
      : never
    : never
) extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];
