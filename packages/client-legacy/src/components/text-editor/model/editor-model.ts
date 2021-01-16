export interface EditorModel {
  cursor: EditorCursor;
  lines: EditorLine[];
}

export interface EditorLine {
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

export interface EditorCursor {
  rawStart: number;
  rawEnd: number;
  direction: "forward" | "backward" | "none";
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export const HEADING_PATTERN = /^(#{1,6}) (.*)/m; // e.g. # My title

export const DEFAULT_CURSOR = {
  direction: "forward" as const,
  endCol: 0,
  endRow: 0,
  rawEnd: 0,
  rawStart: 0,
  startCol: 0,
  startRow: 0,
};
