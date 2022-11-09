const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

export function getSearchRankScore(needle: string, haystack: string) {
  const querySegments = [...segmenter.segment(needle)]
    .filter((seg) => seg.isWordLike)
    .map((segment) => ({ seg: segment.segment, lowerSeg: segment.segment.toLocaleLowerCase() }));
  const titleSegments = [...segmenter.segment(haystack)]
    .filter((seg) => seg.isWordLike)
    .map((segment) => ({ seg: segment.segment, lowerSeg: segment.segment.toLocaleLowerCase() }));

  const result = titleSegments.reduce(
    (total, titleSegment, titlePos) =>
      total +
      querySegments.reduce((subTotal, querySegment) => {
        const posBoost = titlePos === 0 ? 5 : 1;
        switch (true) {
          case titleSegment.seg === querySegment.seg:
            return 8 * posBoost + subTotal;
          case titleSegment.lowerSeg === querySegment.lowerSeg:
            return 5 * posBoost + subTotal;
          case titleSegment.lowerSeg.startsWith(querySegment.lowerSeg):
            return 3 * posBoost + subTotal;
          case titleSegment.lowerSeg.endsWith(querySegment.lowerSeg):
            return 2 + subTotal;
          case titleSegment.lowerSeg.includes(querySegment.lowerSeg):
            return 1 + subTotal;
          default:
            return subTotal;
        }
      }, 0),
    0
  );

  return result;
}
