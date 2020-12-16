let savedRange: Range | undefined = undefined;

export function saveRange() {
  const range = getSelection()?.getRangeAt(0).cloneRange();
  if (range) {
    savedRange = range;
  }
}

export function restoreRange() {
  if (!savedRange) return;

  const selection = getSelection();

  if (selection) {
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }
}
