import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export function useListFilters<F extends Record<string, string>>(
  initialFilters: F,
  debounceMs = 300
) {
  const [initial] = useState(initialFilters);
  const [filters, setFilters] = useState<F>(initial);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput.trim(), debounceMs);

  const filterKey = JSON.stringify([search, filters]);
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  const setPage = useCallback(
    (next: number) => setPageState({ key: filterKey, page: next }),
    [filterKey]
  );

  const setFilter = useCallback(
    <K extends keyof F>(name: K, value: F[K]) =>
      setFilters((current) => ({ ...current, [name]: value })),
    []
  );

  const reset = useCallback(() => {
    setSearchInput('');
    setFilters(initial);
  }, [initial]);

  const hasActiveFilters =
    searchInput !== '' ||
    (Object.keys(initial) as (keyof F)[]).some((key) => filters[key] !== initial[key]);

  const params = useMemo(() => ({ ...filters, search, page }), [filters, search, page]);

  return {
    params,
    page,
    setPage,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    reset,
    hasActiveFilters,
  };
}

export function useClampPage(
  page: number,
  totalPages: number | undefined,
  setPage: (page: number) => void
) {
  useEffect(() => {
    if (totalPages !== undefined && totalPages >= 1 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, setPage]);
}
