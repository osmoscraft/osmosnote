export type VerticalOverflow = "none" | "top" | "bottom" | "both";

export function getVerticalOverflow(target: HTMLElement, container: HTMLElement): VerticalOverflow {
  const { bottom, top } = target.getBoundingClientRect();

  const bottomOverflow = bottom > container.clientHeight;
  const topOverflow = top < 0;

  if (bottomOverflow && topOverflow) return "both";
  if (bottomOverflow && !topOverflow) return "bottom";
  if (!bottomOverflow && topOverflow) return "top";
  return "none";
}
