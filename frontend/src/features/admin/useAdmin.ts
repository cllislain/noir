import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  type AdminEntryFilters,
  type AdminUserCreateData,
  type AdminUserUpdateData,
  type AdminEntryWriteData,
  type AdminTagWriteData,
} from "@/api/endpoints";

const STATS_KEY = ["admin", "stats"] as const;
const USERS_KEY = ["admin", "users"] as const;
const ENTRIES_KEY = ["admin", "entries"] as const;
const TAGS_KEY = ["admin", "tags"] as const;

// ── Stats ─────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: () => adminApi.stats().then((r) => r.data),
  });
}

// ── Users ─────────────────────────────────────────────────────────────────

export function useAdminUsers(params?: { search?: string; ordering?: string; page?: number }) {
  return useQuery({
    queryKey: [...USERS_KEY, params],
    queryFn: () => adminApi.listUsers(params).then((r) => r.data),
  });
}

export function useAdminCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminUserCreateData) => adminApi.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}

export function useAdminUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & AdminUserUpdateData) =>
      adminApi.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useAdminSetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminApi.setPassword(id, password),
  });
}

export function useToggleUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; is_active?: boolean; is_staff?: boolean }) =>
      adminApi.toggleUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}

export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}

// ── Entries ───────────────────────────────────────────────────────────────

export function useAdminEntries(params?: AdminEntryFilters) {
  return useQuery({
    queryKey: [...ENTRIES_KEY, params],
    queryFn: () => adminApi.listEntries(params).then((r) => r.data),
  });
}

export function useAdminCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminEntryWriteData) => adminApi.createEntry(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTRIES_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}

export function useAdminUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & AdminEntryWriteData) =>
      adminApi.updateEntry(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ENTRIES_KEY }),
  });
}

export function useAdminSoftDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTRIES_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}

export function useAdminRestoreEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.restoreEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTRIES_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}

export function useAdminHardDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.hardDeleteEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTRIES_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}

// ── Tags ──────────────────────────────────────────────────────────────────

export function useAdminTags(params?: { search?: string; ordering?: string; page?: number }) {
  return useQuery({
    queryKey: [...TAGS_KEY, params],
    queryFn: () => adminApi.listTags(params).then((r) => r.data),
  });
}

export function useAdminCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminTagWriteData) => adminApi.createTag(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TAGS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}

export function useAdminUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & AdminTagWriteData) =>
      adminApi.updateTag(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TAGS_KEY }),
  });
}

export function useAdminDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteTag(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TAGS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}
