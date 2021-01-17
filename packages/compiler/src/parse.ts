import { rootParser } from "./lib/parsers";

export function parse(input: string): Node[] {
  const start: Point = {
    column: 1,
    line: 1,
    offset: 0,
  };

  return parseRecursive(input, start, rootParser, true);
}

function parseRecursive(input: string, start: Point, parser: Parser, matchResult: PositiveMatch): Node[] {
  if (parser.parseOnEnter) {
    return parser.parseOnEnter({ input: input, start, matchResult });
  }

  let remainingInput = input;
  let currentStart = start;
  let isMatched = false;
  let isExitParserMatched = false;
  const children: Node[] = [];

  while (remainingInput && !isExitParserMatched) {
    for (let childParser of parser.children!) {
      const matchResult = childParser.match(remainingInput);
      if (matchResult) {
        isMatched = true;
        if (parser.childrenMatchToExit?.includes(childParser)) {
          isExitParserMatched = true;
        }

        const nodes = parseRecursive(remainingInput, currentStart, childParser, matchResult);
        children.push(...nodes);

        const lastNode = nodes[nodes.length - 1];
        const end = lastNode.position.end;
        const length = end.offset - currentStart.offset;
        if (lastNode.data?.isLine) {
          currentStart = {
            column: 1,
            line: end.line + 1,
            offset: end.offset,
          };
        } else {
          currentStart = end;
        }
        remainingInput = remainingInput.slice(length);

        break;
      }
    }

    if (!isMatched) {
      /** Use JSON.stringify to print escaped new line and space characters as literal strings: "\n" */
      throw new Error(
        `Unexpected token ${JSON.stringify(input[0])} at Ln ${currentStart.line}, Col ${currentStart.column}`
      );
    }
  }

  return parser.parseOnExit!({ input: input, start, matchResult, children });
}

export interface Parser {
  match: (input: string) => PositiveMatch | NegativeMatch;
  /** Mutually exclusive with `parseOnExit` */
  parseOnEnter?: (input: ParseInput) => Node[];
  /** @todo Future API */
  childrenMatchToEnter?: never;
  /** Required when `parseOnExit` */
  children?: Parser[];
  /** Once matched, stop processing more input */
  childrenMatchToExit?: Parser[];
  /** Mutually exclusive with `parseOnEnter` */
  parseOnExit?: (input: ParseInput) => Node[];
}

export interface ParseInput {
  /** The absolute starting point in the original document */
  start: Point;
  matchResult: PositiveMatch;
  /** The remaining input to be parsed */
  input: string;
  /** Only available on `parseOnExit` */
  children?: Node[];
}

export type PositiveMatch = RegExpMatchArray | true;
export type NegativeMatch = null | false;

export interface Node {
  type: string;
  position: Position;
  value?: string;
  data?: NodeData;
  children?: Node[];
}

export interface NodeData {
  isLine?: boolean;
  /** available on links */
  linkTarget?: string;
  /** available on meta */
  metaKey?: string;
  /** available on meta */
  metaValue?: string;
  /** Heading level or the level of the nearest heading above */
  sectionLevel?: number;
  /** available to heading or list item  */
  titleText?: string;
  /** available to heading only */
  headingHashes?: string;
}

export interface Position {
  start: Point;
  end: Point;
}

export interface Point {
  line: number;
  column: number;
  offset: number;
}
