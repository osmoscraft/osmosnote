import { RootNode, rootSchema } from "./nodes/root";

/**
 * Tokenize and build AST
 */
export function parse(input: string): RootNode {
  const pageChildNodes: RootNode["childNodes"] = [];
  let currentOffset = 0;
  let remainingInput = input;

  while (remainingInput.length) {
    let isMatched = false;

    for (let schema of rootSchema.childSchemas) {
      const match = remainingInput.match(schema.pattern);
      if (match?.[0]) {
        const matchLength = match[0].length;

        const node = {
          type: schema.type,
          start: currentOffset,
          end: currentOffset + matchLength,
          data: {
            value: match[0],
          },
          childNodes: [], // TOOD handle inline tokens (no recursion needed yet as inline tokens don't nest)
        } as RootNode["childNodes"][number];

        // TODO if needed, call `onBeforeVist` hook

        const data = schema.initializeData?.(node, match);
        if (data) {
          (node as any).data = data;
        }

        pageChildNodes.push(node);

        currentOffset += matchLength;
        remainingInput = remainingInput.slice(matchLength);

        // stop matching rest of the tokens
        isMatched = true;
        break;
      }
    }

    if (!isMatched) {
      throw new Error(
        `Unexpected character at ${currentOffset}: -> ${remainingInput[0]} <- ${remainingInput.slice(1, 100)} `
      );
    }
  }

  return {
    type: "root",
    start: 0,
    end: currentOffset,
    childNodes: pageChildNodes,
  };
}
