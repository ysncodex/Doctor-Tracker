/**
 * Make sure the currently selected value is always in the list. Otherwise, if
 * the last record with that value is deleted while it is selected, the
 * dropdown would silently show a blank selection.
 */
export function withSelected(options: readonly string[] | undefined, selected: string): string[] {
  const list = options ?? [];
  return selected && !list.includes(selected) ? [...list, selected] : [...list];
}

/** Merge starter suggestions with real values for form autocomplete, de-duplicated ignoring case. */
export function mergeSuggestions(
  starters: readonly string[],
  stored: readonly string[] | undefined
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const item of [...(stored ?? []), ...starters]) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
}
