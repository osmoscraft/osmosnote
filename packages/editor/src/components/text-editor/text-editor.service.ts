import { Node, parse, Point, Position } from "@system-two/compiler";
import { astToHtml } from "./compiler/emit";

export interface Cursor {
  position: Position;
  /** The column where the cursor should be, if there were enough content. The value could be greater than the actual length of the line */
  idealColumn: number;
}

export class TextEditorService {
  private ast!: Node[];
  private cursor!: Cursor;

  public initWithText(text: string) {
    this.ast = parse(text);

    console.log(this.ast);
  }

  public getHtml() {
    return astToHtml(this.ast);
  }

  public handleMovement() {
    // Todo: update cursor based on movement comment: up/down/left/right as mvp
  }

  public handleClick(pathString: string, offset: number) {
    const path = pathString.split("-").map((index) => parseInt(index));
    console.log([path, offset]);

    let index;
    let astNode;
    let children = this.ast;
    while (path.length) {
      index = path.shift()!;
      astNode = children[index];
      children = astNode.children!;
    }

    if (astNode) {
      const start: Point = {
        line: astNode.position.start.line,
        column: astNode.position.start.column + offset,
        offset: astNode.position.start.offset + offset,
      };

      this.cursor = {
        idealColumn: start.column,
        position: {
          start,
          end: { ...start },
        },
      };

      console.log(this.cursor);
    }
  }
}
