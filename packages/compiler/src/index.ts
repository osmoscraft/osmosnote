import { RootNode, rootSchema } from "./nodes/root";
import type { ParentNode, ParentSchema } from "./schema/schema";

/**
 * Tokenize and build AST
 */
export function parse(input: string): RootNode {
  const pageChildren: RootNode["children"] = [];
  let currentOffset = 0;
  let remainingInput = input;

  while (remainingInput.length) {
    let isMatched = false;

    for (let schema of rootSchema.children) {
      const match = remainingInput.match(schema.pattern);
      if (match?.[0]) {
        const matchLength = match[0].length;

        const node = {
          type: schema.type,
          start: currentOffset,
          end: currentOffset + matchLength,
        } as RootNode["children"][number];

        if ((schema as ParentSchema).children) {
          (node as ParentNode).children = []; // TODO recursive parsing
        }

        // TODO if needed, call `onBeforeVist` hook

        (schema as ParentSchema).onAfterVisit?.(node as ParentNode, match);

        pageChildren.push(node);

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
    children: pageChildren,
  };
}
