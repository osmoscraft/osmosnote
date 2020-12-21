let savedRange: Range | undefined = undefined;

export function saveRange() {
  try {
    const range = getSelection()?.getRangeAt(0).cloneRange();
    if (range) {
      savedRange = range;
    }
  } catch (error) {}
}

export function restoreRange() {
  if (!savedRange) return;

  const selection = getSelection();

  if (selection) {
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }
}
