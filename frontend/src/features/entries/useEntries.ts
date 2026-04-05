import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entriesApi, attachmentsApi, versionsApi, shareApi, type EntryFilters } from "@/api/endpoints";
import type { Entry } from "@/types";

const ENTRIES_KEY = ["entries"] as const;
const TRASH_KEY = ["entries", "trash"] as const;
const STREAK_KEY = ["entries", "streak"] as const;

/** Extract the next page number from a DRF paginated `next` URL, e.g. "…?page=3" → 3 */
function extractPage(url: string | null): number | undefined {
  if (!url) return undefined;
  const match = url.match(/[?&]page=(\d+)/);
  return match ? Number(match[1]) : undefined;
}

// ── Active entries ────────────────────────────────────────────────────────

export function useEntries(filters?: EntryFilters) {
  return useQuery({
    queryKey: [...ENTRIES_KEY, filters],
    queryFn: () => entriesApi.list(filters).then((r) => r.data),
  });
}

/** Infinite-scroll version — flattens pages automatically. */
export function useInfiniteEntries(filters?: Omit<EntryFilters, "page">) {
  return useInfiniteQuery({
    queryKey: [...ENTRIES_KEY, "infinite", filters],
    queryFn: ({ pageParam }) =>
      entriesApi.list({ ...filters, page: pageParam as number }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => extractPage(lastPage.next),
  });
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: [...ENTRIES_KEY, id],
    queryFn: () => entriesApi.get(id).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Entry> & { tag_ids?: string[] }) => entriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTRIES_KEY });
      qc.invalidateQueries({ queryKey: STREAK_KEY });
    },
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Entry> & { tag_ids?: string[] }) =>
      entriesApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ENTRIES_KEY });
      qc.invalidateQueries({ queryKey: [...ENTRIES_KEY, id] });
    },
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTRIES_KEY });
      qc.invalidateQueries({ queryKey: TRASH_KEY });
      qc.invalidateQueries({ queryKey: STREAK_KEY });
    },
  });
}

// ── Attachments ───────────────────────────────────────────────────────────

export function useUploadAttachment(entryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentsApi.upload(entryId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ENTRIES_KEY, entryId] }),
  });
}

export function useDeleteAttachment(entryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => attachmentsApi.delete(entryId, attachmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ENTRIES_KEY, entryId] }),
  });
}

// ── Versions ─────────────────────────────────────────────────────────────

export function useEntryVersions(entryId: string) {
  return useQuery({
    queryKey: [...ENTRIES_KEY, entryId, "versions"],
    queryFn: () => versionsApi.list(entryId).then((r) => r.data),
    enabled: Boolean(entryId),
    staleTime: 30 * 1000,
  });
}

// ── Share ─────────────────────────────────────────────────────────────────

export function useEnableShare(entryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shareApi.enable(entryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ENTRIES_KEY, entryId] }),
  });
}

export function useDisableShare(entryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shareApi.disable(entryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...ENTRIES_KEY, entryId] }),
  });
}

// ── Trash ─────────────────────────────────────────────────────────────────

export function useTrashEntries() {
  return useInfiniteQuery({
    queryKey: TRASH_KEY,
    queryFn: ({ pageParam }) =>
      entriesApi.trash({ page: pageParam as number }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => extractPage(lastPage.next),
  });
}

export function useRestoreEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entriesApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTRIES_KEY });
      qc.invalidateQueries({ queryKey: TRASH_KEY });
      qc.invalidateQueries({ queryKey: STREAK_KEY });
    },
  });
}

export function useHardDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entriesApi.hardDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRASH_KEY });
      qc.invalidateQueries({ queryKey: STREAK_KEY });
    },
  });
}
