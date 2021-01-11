import { rootParser } from "./parsers";

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
  const children: Node[] = [];

  while (remainingInput) {
    for (let childParser of parser.children!) {
      const matchResult = childParser.match(remainingInput);
      if (matchResult) {
        isMatched = true;

        const nodes = parseRecursive(remainingInput, currentStart, childParser, matchResult);
        children.push(...nodes);

        const lastNode = nodes[nodes.length - 1];
        const end = lastNode.position.end;
        const length = end.offset - currentStart.offset;
        if (lastNode.data?.isLineNode) {
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
  /** Required when `parseOnExit` */
  children?: Parser[];
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
  position: Poisiton;
  value?: string;
  data?: NodeData;
  children?: Node[];
}

export interface NodeData {
  isLineNode?: boolean;
}

export interface Poisiton {
  start: Point;
  end: Point;
}

export interface Point {
  line: number;
  column: number;
  offset: number;
}
