import { useState, useCallback } from "react";
import type { EntryFilters, SortOrder } from "@/api/endpoints";

const SORT_STORAGE_KEY = "journal-sort";
const DEFAULT_SORT: SortOrder = "-created_at";

function readStoredSort(): SortOrder {
  try {
    const v = localStorage.getItem(SORT_STORAGE_KEY);
    if (v === "-created_at" || v === "created_at" || v === "-updated_at") return v;
  } catch { /* ignore */ }
  return DEFAULT_SORT;
}

export function useSearch() {
  const [filters, setFilters] = useState<EntryFilters>({
    ordering: readStoredSort(),
  });

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  }, []);

  const setMood = useCallback((mood: string) => {
    setFilters((prev) => ({ ...prev, mood: mood || undefined, page: 1 }));
  }, []);

  const setTags = useCallback((tags: string) => {
    setFilters((prev) => ({ ...prev, tags: tags || undefined, page: 1 }));
  }, []);

  const setFavorite = useCallback((val: boolean | undefined) => {
    setFilters((prev) => ({ ...prev, is_favorite: val, page: 1 }));
  }, []);

  const setOrdering = useCallback((ordering: SortOrder) => {
    try { localStorage.setItem(SORT_STORAGE_KEY, ordering); } catch { /* ignore */ }
    setFilters((prev) => ({ ...prev, ordering, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setDateRange = useCallback((after: string | undefined, before: string | undefined) => {
    setFilters((prev) => ({ ...prev, created_after: after, created_before: before, page: 1 }));
  }, []);

  const reset = useCallback(() => {
    setFilters({ ordering: readStoredSort() });
  }, []);

  return { filters, setSearch, setMood, setTags, setFavorite, setOrdering, setPage, setDateRange, reset };
}
