import type { Node, Parser } from "./compile";

export const headingLineParser: Parser = {
  match: (input: string) => input.match(/^(\s*)#+ .*\n?/),
  parseOnEnter: ({ start, matchResult }) => {
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
        isLineNode: true,
      },
    };

    return [headingLineNode];
  },
};

export const metaLineParser: Parser = {
  match: (input: string) => input.match(/^#\+.+?: .*\n?/),
  parseOnEnter: ({ start, matchResult }) => {
    const metaLinNode: Node = {
      type: "MetaLine",
      position: {
        start,
        end: {
          column: 1 + (matchResult as RegExpMatchArray)[0].length,
          line: start.line,
          offset: start.offset + (matchResult as RegExpMatchArray)[0].length,
        },
      },
      data: {
        isLineNode: true,
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
        isLineNode: true,
      },
    };

    return [blankLineNode];
  },
};

export const paragraphLineParser: Parser = {
  match: (input: string) => input.match(/^.*\n?/),
  parseOnEnter: ({ start, matchResult }) => {
    const paragraphLineNode: Node = {
      type: "ParagraphLine",
      position: {
        start,
        end: {
          column: 1 + (matchResult as RegExpMatchArray)[0].length,
          line: start.line,
          offset: start.offset + (matchResult as RegExpMatchArray)[0].length,
        },
      },
      data: {
        isLineNode: true,
      },
    };

    return [paragraphLineNode];
  },
};

export const rootParser: Parser = {
  match: () => true,
  parseOnExit: ({ start, children }) => {
    const end = children?.length ? children[children.length - 1].position.end : start;

    const rootNode: Node = {
      type: "Root",
      children: children,
      position: {
        start,
        end,
      },
    };

    return [rootNode];
  },
  children: [blankLineParser, headingLineParser, metaLineParser, paragraphLineParser],
};
