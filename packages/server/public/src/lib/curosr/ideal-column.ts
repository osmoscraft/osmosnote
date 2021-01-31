import { createState } from "../global-state.js";
import { getPositionByOffset, getInlineOffset, getLine } from "../line-query.js";
import { getCursor } from "./cursor-query.js";

export const [getIdealColumn, setIdealColumn] = createState<null | number>(null);

export function updateIdealColumn() {
  const cursor = getCursor();

  if (cursor) {
    const { node, offset } = cursor.end;
    const inlineOffset = getInlineOffset(node, offset);
    const currentLine = getLine(node)!;
    const { column } = getPositionByOffset(currentLine, inlineOffset);
    setIdealColumn(column);
  }
}
