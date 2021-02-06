import { createState } from "../global-state.js";
import { getCursor, getCursorLinePosition } from "./cursor-query.js";

export const [getIdealColumn, setIdealColumn] = createState<null | number>(null);

export function updateIdealColumn() {
  const cursor = getCursor();

  if (cursor) {
    const { column } = getCursorLinePosition(cursor.focus);
    setIdealColumn(column);
  }
}
