import { createState } from "../../../../utils/global-state-factory.js";
import { getCursorFromDom, getCursorLinePosition } from "./cursor-query.js";

export const [getIdealColumn, setIdealColumn] = createState<null | number>(null);

export function updateIdealColumn() {
  const cursor = getCursorFromDom();

  if (cursor) {
    const { column } = getCursorLinePosition(cursor.focus);
    setIdealColumn(column);
  }
}
