export interface SemanticModel {
  lines: SemanticLine[];
}

export interface SemanticLine {
  raw: string;
  innerText: string;
  isEmpty: boolean;
  isHeading: boolean;
  isListItem: boolean;
  layoutPadding: number;
  listItemLevel: number;
  sectionLevel: number;
  isInvalid: boolean;
}

export const HEADING_PATTERN = /^(#{1,6}) (.*)/m; // e.g. # My title
