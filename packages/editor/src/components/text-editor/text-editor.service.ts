import { Node, parse, Point, Position } from "@system-two/compiler";
import { astToHtml, astToText } from "./compiler/emit";
import { findNodeAtPoint } from "./utils/find";
import { getPathStringToNode } from "./utils/path";
import { getShiftedPosition } from "./utils/position";

export interface Cursor {
  position: Position;
  /** The column where the cursor should be, if there were enough content. The value could be greater than the actual length of the line */
  idealColumn: number;
}

export interface TextEditorEventHandlers {
  onUpdate: () => void;
}

export interface CursorDetails {
  nodeAtCursor: Node;
  pathToNode: string;
  offsetToNode: number;
}

export class TextEditorService {
  private ast!: Node[];
  private cursor!: Cursor;

  private notifyUpdate?: () => void;

  public resetCursor() {
    this.cursor = {
      idealColumn: 1,
      position: {
        start: {
          line: 1,
          column: 1,
          offset: 0,
        },
        end: {
          line: 1,
          column: 1,
          offset: 0,
        },
      },
    };
  }

  public getCursor() {
    return this.cursor;
  }

  public getCursorDetails(): CursorDetails | null {
    const nodeAtCursor = this.getNodeAtCursor();
    if (!nodeAtCursor) {
      return null;
    }

    const pathToNode = getPathStringToNode(nodeAtCursor, this.ast);
    const offsetToNode = this.cursor.position.start.offset - nodeAtCursor.position.start.offset;

    return {
      nodeAtCursor,
      pathToNode,
      offsetToNode,
    };
  }

  public handleEvents(handlers: TextEditorEventHandlers) {
    this.notifyUpdate = handlers.onUpdate;
  }

  public setText(text: string) {
    this.ast = parse(text);
  }

  public getHtml() {
    return astToHtml(this.ast);
  }

  public cursorLeft() {
    this.shiftCursor(-1);

    this.notifyUpdate?.();
  }

  public cursorRight() {
    this.shiftCursor(1);

    this.notifyUpdate?.();
  }

  // TODO handle insertion on selection range
  public insertAtCursor(input: string) {
    const text = astToText(this.ast);
    const insertionPoint = this.cursor.position.start.offset;
    const newText = text.slice(0, insertionPoint) + input + text.slice(insertionPoint);

    this.setText(newText);
    this.shiftCursor(input.length);

    this.notifyUpdate?.();
  }

  public handleClick(pathString: string, offset: number) {
    const path = pathString.split("-").map((index) => parseInt(index));

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
    }
  }

  private getNodeAtCursor() {
    const node = findNodeAtPoint(this.ast, this.cursor.position.start); // TODO, handle non-collapsed cursor
    return node;
  }

  private shiftCursor(offset: number) {
    const newPosition = getShiftedPosition(this.cursor.position, offset);

    this.cursor = {
      ...this.cursor,
      position: newPosition,
      idealColumn: this.cursor.idealColumn + offset,
    };
  }
}
