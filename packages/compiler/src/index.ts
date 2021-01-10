import type { NodeChildToSchemaChild } from "./utils/node-to-schema";

const lineHeadingSchema: ASTSchema<LineHeadingNode> = {
  type: "LineHeading",
  pattern: /^(\s*)#+ .*\n?/,
  onAfterVisit: ({ node, match }) => {},
};

const lineEmptySchema: ASTSchema<LineEmptyNode> = {
  type: "LineEmpty",
  pattern: /^\n/,
};

const lineMetaSchema: ASTSchema<LineMetaNode> = {
  type: "LineMeta",
  pattern: /^#\+.+?: .*\n?/,
};

const inlineLinkSchema: ASTSchema<InlineLinkNode> = {
  type: "InlineLink",
  pattern: /\[.+?\]\(.+?\)/,
};

const inlineTextSchema: ASTSchema<InlineTextNode> = {
  type: "InlineText",
  pattern: /.*/,
};

const lineParagraphSchema: ASTSchema<LineParagraphNode> = {
  type: "LineParagraph",
  pattern: /^.*\n?/,
  child: [inlineLinkSchema, inlineTextSchema],
};

const rootSchema: ASTSchema<RootNode> = {
  type: "root",
  pattern: /.*/, // Not used, just for completeness
  child: [lineEmptySchema, lineHeadingSchema, lineMetaSchema, lineParagraphSchema],
};

const nodeSchemas = [lineEmptySchema, lineHeadingSchema, lineMetaSchema, lineParagraphSchema];

/**
 * Tokenize and build AST
 */
export function parse(input: string): RootNode {
  const pageChildNodes: ASTNode[] = [];
  let currentOffset = 0;
  let remainingInput = input;

  while (remainingInput.length) {
    let isMatched = false;

    for (let schema of nodeSchemas) {
      const match = remainingInput.match(schema.pattern);
      if (match?.[0]) {
        const matchLength = match[0].length;
        const node: ASTNode = {
          type: schema.type,
          range: {
            start: {
              offset: currentOffset,
            },
            end: {
              offset: currentOffset + matchLength,
            },
          },
          child: match[0],
        };

        // TODO if needed, call `onBeforeVist` hook

        // TOOD handle inline tokens (no recursion needed yet as inline tokens don't nest)

        (schema as ASTSchema<ASTNode>).onAfterVisit?.({ node, match });

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

export interface ASTSchema<T extends ASTNode> {
  type: T["type"];
  pattern: RegExp;
  child?: NodeChildToSchemaChild<T>;
  onAfterVisit?: (config: { node: T; match: RegExpMatchArray }) => void;
}

export interface ASTNode {
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
  child: (LineEmptyNode | LineHeadingNode | LineMetaNode | LineParagraphNode)[];
}

interface LineEmptyNode extends ASTNode {
  type: "LineEmpty";
  child: string;
}

interface LineMetaNode extends ASTNode {
  type: "LineMeta";
  child: string;
}

interface LineHeadingNode extends ASTNode {
  type: "LineHeading";
  indentWidth: number;
  sectionLevel: number;
}

interface LineParagraphNode extends ASTNode {
  type: "LineParagraph";
  child: (InlineTextNode | InlineLinkNode)[];
}

interface InlineTextNode extends ASTNode {
  type: "InlineText";
  child: string;
}

interface InlineLinkNode extends ASTNode {
  type: "InlineLink";
}
