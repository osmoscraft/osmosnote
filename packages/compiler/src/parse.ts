export function parse(input: string, parser: Parser): Node[] {
  if (parser.parseOnEnter) {
    return parser.parseOnEnter(input);
  }

  const remainingInput = input;
  const childNodes: Node[] = [];

  while (remainingInput) {
    for (let childParser of parser.children) {
      if (remainingInput.match(childParser.pattern)) {
        childNodes.push(...parse(remainingInput, childParser));
      }
      // update remainingInput

      break;
    }
  }

  return parser.parseOnExit!(input, childNodes);
}

interface Parser {
  pattern: RegExp;
  children: Parser[];
  parseOnEnter?: (input: string) => Node[];
  parseOnExit?: (input: string, children?: Node[]) => Node[];
}

interface Node {
  type: string;
  value?: string;
  data?: any;
  children?: Node[];
}
