const lineTokens = {
  // line level
  emptyLine: /^\n/,
  heading: /^\s*#+ .*\n?/,
  paragraph: /^.*\n?/,
};

const inlineTokens = {
  // inline level
  link: /\[.+?\]\(.+?\)/,
};

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let currentOffset = 0;
  let remainingInput = input;
  const candidateTokens = [...Object.entries(lineTokens)];

  while (remainingInput.length) {
    for (let [tokenType, tokenPattern] of candidateTokens) {
      const match = remainingInput.match(tokenPattern);
      if (match?.[0]) {
        const matchLength = match[0].length;
        tokens.push({
          type: tokenType,
          startOffset: currentOffset,
          endOffset: currentOffset + matchLength,
          value: match[0],
        });

        // TOOD handle inline tokens (no recursion needed yet as inline tokens don't nest)

        currentOffset += matchLength;
        remainingInput = remainingInput.slice(matchLength);
        continue;
      }
    }
  }

  return tokens;
}

interface Token {
  type: string;
  startOffset: number;
  endOffset: number;
  value: string;
}

function parse(token: Token[]): ASTNode {
  return {
    type: "page",
    range: {
      start: {
        offset: 0,
      },
      end: {
        offset: 0,
      },
    },
    child: [],
  };
}

interface ASTRange {
  start: ASTPosition;
  end: ASTPosition;
}

interface ASTPosition {
  offset: number;
}

interface ASTNode {
  type: string;
  range: ASTRange;
  child?: any;
}

interface PageNode extends ASTNode {
  type: "page";
  child: (EmptyLineNode | HeadingNode | ParagraphNode)[];
}

interface EmptyLineNode extends ASTNode {
  type: "emptyLine";
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
}

interface InlineLinkNode extends ASTNode {
  type: "inlineLink";
}
