/** Drop empty values so URLs stay clean (`?page=1`, not `?search=&condition=&...`). */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  ) as Partial<T>;
}
