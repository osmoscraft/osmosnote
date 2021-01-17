import type { Node, Parser } from "../parse";

export const headingLineParser: Parser = {
  match: (input: string) => input.match(/^(\s*)(#+) (.*)\n?/),
  parseOnEnter: ({ start, matchResult }) => {
    const [_, spaces, hashes, text] = matchResult as RegExpMatchArray;

    const headingLineNode: Node = {
      type: "HeadingLine",
      position: {
        start,
        end: {
          column: 1 + (matchResult as RegExpMatchArray)[0].length,
          line: start.line,
          offset: start.offset + (matchResult as RegExpMatchArray)[0].length,
        },
      },
      data: {
        isLine: true,
        sectionLevel: spaces.length,
        headingHashes: hashes,
        titleText: text,
      },
    };

    return [headingLineNode];
  },
};

export const metaLineParser: Parser = {
  match: (input: string) => input.match(/^#\+(.+?): (.*)\n?/),
  parseOnEnter: ({ start, matchResult }) => {
    const [rawMatch, metaKey, metaValue] = matchResult as RegExpMatchArray;

    const metaLinNode: Node = {
      type: "MetaLine",
      position: {
        start,
        end: {
          column: 1 + rawMatch.length,
          line: start.line,
          offset: start.offset + rawMatch.length,
        },
      },
      data: {
        isLine: true,
        metaKey,
        metaValue,
      },
    };

    return [metaLinNode];
  },
};

export const blankLineParser: Parser = {
  match: (input: string) => input.match(/^\n/), // TODO support multiple whitespace
  parseOnEnter: ({ start, matchResult }) => {
    const blankLineNode: Node = {
      type: "BlankLine",
      position: {
        start,
        end: {
          column: 1 + (matchResult as RegExpMatchArray)[0].length,
          line: start.line,
          offset: start.offset + (matchResult as RegExpMatchArray)[0].length,
        },
      },
      data: {
        isLine: true,
      },
    };

    return [blankLineNode];
  },
};

export const textInlineParser: Parser = {
  match: (input: string) => input.match(/^\n|.+\n?/),
  parseOnEnter: ({ start, matchResult }) => {
    const matchLiteral = (matchResult as RegExpMatchArray)[0];

    const textInlineNode: Node = {
      type: "TextInline",
      value: matchLiteral,
      position: {
        start,
        end: {
          column: 1 + matchLiteral.length,
          line: start.line,
          offset: start.offset + matchLiteral.length,
        },
      },
    };

    return [textInlineNode];
  },
};

export const linkInlineParser: Parser = {
  match: (input: string) => input.match(/^(.*?)(\[.+?\]\((.+?)\))/),
  parseOnEnter: ({ start, matchResult }) => {
    const [_, textInlineMatch, linkInlineMatch, linkTargetMatch] = matchResult as RegExpMatchArray;

    const nodes: Node[] = [];

    if (textInlineMatch) {
      const textInlineNode: Node = {
        type: "TextInline",
        value: textInlineMatch,
        position: {
          start,
          end: {
            column: start.column,
            line: start.line,
            offset: start.offset + textInlineMatch.length,
          },
        },
      };

      nodes.push(textInlineNode);
    }

    const linkInlineNode: Node = {
      type: "LinkInline",
      value: linkInlineMatch,
      data: {
        linkTarget: linkTargetMatch,
      },
      position: {
        start: {
          column: start.column + textInlineMatch.length,
          line: start.line,
          offset: start.offset + textInlineMatch.length,
        },
        end: {
          column: start.column + textInlineMatch.length + linkInlineMatch.length,
          line: start.line,
          offset: start.offset + textInlineMatch.length + linkInlineMatch.length,
        },
      },
    };

    nodes.push(linkInlineNode);

    return nodes;
  },
};

export const paragraphLineParser: Parser = {
  match: () => true,
  parseOnExit: ({ start, children }) => {
    const end = children?.length ? children[children.length - 1].position.end : start;

    const paragraphLineNode: Node = {
      type: "ParagraphLine",
      children,
      position: {
        start,
        end,
      },
      data: {
        isLine: true,
      },
    };

    return [paragraphLineNode];
  },
  children: [linkInlineParser, textInlineParser],
  childrenMatchToExit: [textInlineParser],
};

export const rootParser: Parser = {
  match: () => true,
  parseOnExit: ({ start, children }) => {
    const end = children?.length ? children[children.length - 1].position.end : start;

    const rootNode: Node = {
      type: "Root",
      children,
      position: {
        start,
        end,
      },
    };

    return [rootNode];
  },
  children: [blankLineParser, headingLineParser, metaLineParser, paragraphLineParser],
};
