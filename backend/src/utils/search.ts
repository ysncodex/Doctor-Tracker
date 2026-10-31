const MAX_SEARCH_LENGTH = 100;

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Returns a trimmed, whitespace-collapsed search term, or `undefined` when empty/invalid. */
export function normalizeSearchTerm(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const term = value.replace(/\s+/g, ' ').trim().slice(0, MAX_SEARCH_LENGTH);

  return term || undefined;
}

/**
 * Case-insensitive "starts a word" match: "smith" finds "Dr. John Smith",
 * "ohn" does not.
 *
 * It is deliberately not a plain substring match, so results stay relevant
 * as you type and Mongo can scan an index instead of every document.
 */
export function wordPrefixRegex(term: string): RegExp {
  return new RegExp(`(^|[\\s.,'’\\-])${escapeRegex(term)}`, 'i');
}

const MAX_SEARCH_WORDS = 5;

/**
 * Build a filter where every word the admin typed must start a word in at
 * least one of the given fields. "john cardio" therefore finds Dr. John Smith
 * (Cardiology), and word order does not matter.
 */
export function buildWordSearch(fields: string[], term: string): { $and: Record<string, unknown>[] } {
  const words = term.split(' ').filter(Boolean).slice(0, MAX_SEARCH_WORDS);

  return {
    $and: words.map((word) => {
      const regex = wordPrefixRegex(word);

      return fields.length === 1
        ? { [fields[0]]: regex }
        : { $or: fields.map((field) => ({ [field]: regex })) };
    }),
  };
}

export function sortAlphabetically(values: unknown[]): string[] {
  return values
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
}

/** Collapse inner whitespace so "Heart   Disease " and "Heart Disease" are the same value. */
export function tidyLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Reuse the spelling already stored for a label ("cardiology" -> "Cardiology")
 * so differences in capitalisation never create duplicate filter options.
 */
export function matchExistingLabel(existing: unknown[], value: string): string {
  const wanted = value.toLowerCase();
  const match = existing.find(
    (item): item is string => typeof item === 'string' && item.toLowerCase() === wanted
  );

  return match ?? value;
}
