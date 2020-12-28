export interface EngineModel {
  cursor?: EngineModelCursor;
  lines: EngineModelLine[];
}

export interface EngineModelLine {
  raw: string;
  innerText: string;
  isEmpty: boolean;
  isHeading: boolean;
  isListItem: boolean;
  indentation: number;
  listItemLevel: number;
  sectionLevel: number;
  isFormatNeeded: boolean;
}

export interface EngineModelCursor {
  rawStart: number;
  rawEnd: number;
  direction: "forward" | "backward" | "none";
  row: number;
  col: number;
}

export const HEADING_PATTERN = /^(#{1,6}) (.*)/m; // e.g. # My title
