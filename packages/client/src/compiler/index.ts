/*
TODO
replace line-based regex with recursive token based regex
because some line-level elements are mutually exclusive.

e.g. ``` fence should not be in a heading.  "``` # Text" and "# Text ```" cannot both be parsed with a single line of regex

*/

const lineRegex = /^(?<indent>[ ]*)?(?<headingPrefix>(?:#+ )?)?(?<listPrefix>(?:\d\.) |- )?(?<restOfText>.*)?(?<lineEnd>\r?\n)?/gm;

export interface Token {
  name: "indent" | "headingPrefix" | "listPrefix" | "lineEnd";
  start: number;
  end: number;
  value: string;
}

export function tokenize(input: string) {
  const tokens: Token[] = [];

  const lineMatches = [...input.matchAll(lineRegex)];
  for (let match of lineMatches) {
    const lineStart = match.index!;
    let matchStart = lineStart;

    Object.entries(match.groups!).forEach(([name, match]) => {
      if (match) {
        const matchEnd = matchStart + match.length;

        const token: Token = {
          name: name as Token["name"],
          start: matchStart,
          end: matchEnd,
          value: match,
        };

        if (name === "restOfText") {
          // parse inner content

          tokens.push(...tokenizeRestOfText(token));
        } else {
          tokens.push(token);
        }
        matchStart = matchEnd;
      }
    });
  }

  printDebug(tokens);
  // console.log(tokens);
}

function tokenizeRestOfText(temporaryToken: Token): Token[] {
  // tag, []()link, TODO/DONE keywords, hyperlinks

  return [];
}

document.querySelector("textarea")!.addEventListener("input", (e) => tokenize((e.target as any).value));

function printDebug(object: any) {
  document.querySelector("code")!.innerHTML = JSON.stringify(object, null, 2);
}
