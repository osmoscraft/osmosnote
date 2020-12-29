export interface EngineModel {
  cursor: EngineModelCursor;
  lines: EngineModelLine[];
}

export interface EngineModelLine {
  fileRaw: string;
  draftRaw: string;
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

export const DEFAULT_CURSOR = {
  rawStart: 0,
  rawEnd: 0,
  direction: "forward" as const,
  row: 0,
  col: 0,
};
