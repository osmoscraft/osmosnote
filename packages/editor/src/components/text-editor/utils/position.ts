import type { Point, Position } from "@system-two/compiler";

export function getShiftedPosition(sourcePosition: Position, offset: number) {
  return {
    start: {
      line: sourcePosition.start.line,
      column: sourcePosition.start.column + offset,
      offset: sourcePosition.start.offset + offset,
    },
    end: {
      line: sourcePosition.end.line,
      column: sourcePosition.end.column + offset,
      offset: sourcePosition.end.offset + offset,
    },
  };
}

export function clonePosition(sourcePosition: Position): Position {
  return {
    start: {
      ...sourcePosition.start,
    },
    end: {
      ...sourcePosition.end,
    },
  };
}

export function isPointInPosition(point: Point, position: Position): boolean {
  return position.start.offset <= point.offset && point.offset <= position.end.offset;
}

export function isPositionEqual(a: Position, b: Position): boolean {
  return a.start.offset === b.start.offset && a.end.offset === b.end.offset;
}
