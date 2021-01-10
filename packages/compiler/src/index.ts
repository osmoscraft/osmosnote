const lineNodes = {
  emptyLine: /^\n/,
  heading: /^\s*#+ .*\n?/,
  meta: /^#\+.+?: .*\n?/,
  paragraph: /^.*\n?/,
};

const inlineNodes = {
  link: /\[.+?\]\(.+?\)/,
};

/**
 * Tokenize and build AST
 */
export function parse(input: string): RootNode {
  const pageChildNodes: ASTNode[] = [];
  let currentOffset = 0;
  let remainingInput = input;
  const candidateTokens = [...Object.entries(lineNodes)];

  while (remainingInput.length) {
    let isMatched = false;

    for (let [nodeType, nodePattern] of candidateTokens) {
      const match = remainingInput.match(nodePattern);
      if (match?.[0]) {
        const matchLength = match[0].length;
        pageChildNodes.push({
          type: nodeType,
          range: {
            start: {
              offset: currentOffset,
            },
            end: {
              offset: currentOffset + matchLength,
            },
          },
          child: match[0],
        });

        // TOOD handle inline tokens (no recursion needed yet as inline tokens don't nest)

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
    range: {
      start: {
        offset: 0,
      },
      end: {
        offset: currentOffset,
      },
    },
    child: pageChildNodes as RootNode["child"],
  };
}

interface ASTNode {
  type: string;
  range: ASTRange;
  child: string | ASTNode[];
  data?: any;
}

interface ASTRange {
  start: ASTPosition;
  end: ASTPosition;
}

interface ASTPosition {
  offset: number;
}

interface RootNode extends ASTNode {
  type: "root";
  child: (EmptyLineNode | HeadingNode | ParagraphNode)[];
}

interface EmptyLineNode extends ASTNode {
  type: "emptyLine";
  child: string;
}

interface HeadingNode extends ASTNode {
  type: "heading";
}

interface ParagraphNode extends ASTNode {
  type: "paragraph";
  child: (InlineLinkNode | TextNode)[];
}

interface TextNode extends ASTNode {
  type: "text";
  child: string;
}

interface InlineLinkNode extends ASTNode {
  type: "inlineLink";
}
