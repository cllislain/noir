import axios from "axios";
import { apiClient } from "./client";
import type {
  User,
  AuthTokens,
  Entry,
  EntryVersion,
  Tag,
  Attachment,
  PaginatedResponse,
  MoodTrendPoint,
  MonthlyRecap,
  OnThisDayEntry,
  StreakData,
  HeatmapData,
  SiteSettings,
  SharedLink,
  AdminStats,
  AdminUser,
  AdminEntry,
  AdminTag,
} from "@/types";

// Auth
export const authApi = {
  register: (data: { email: string; username: string; password: string; password_confirm: string }) =>
    apiClient.post<{ user: User } & AuthTokens>("/auth/register/", data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthTokens>("/auth/login/", data),

  refresh: (refresh: string) =>
    apiClient.post<AuthTokens>("/auth/refresh/", { refresh }),

  logout: (refresh: string) =>
    apiClient.post("/auth/logout/", { refresh }),

  me: () =>
    apiClient.get<User>("/auth/me/"),
};

// Entries
export type SortOrder = "-created_at" | "created_at" | "-updated_at";

export interface EntryFilters {
  search?: string;
  tags?: string;
  mood?: string;
  is_favorite?: boolean;
  created_after?: string;
  created_before?: string;
  ordering?: SortOrder;
  page?: number;
  page_size?: number;
}

export const entriesApi = {
  list: (params?: EntryFilters) =>
    apiClient.get<PaginatedResponse<Entry>>("/entries/", { params }),

  get: (id: string) =>
    apiClient.get<Entry>(`/entries/${id}/`),

  create: (data: Partial<Entry> & { tag_ids?: string[] }) =>
    apiClient.post<Entry>("/entries/", data),

  update: (id: string, data: Partial<Entry> & { tag_ids?: string[] }) =>
    apiClient.patch<Entry>(`/entries/${id}/`, data),

  /** Soft-deletes the entry (moves to trash) */
  delete: (id: string) =>
    apiClient.delete(`/entries/${id}/`),

  // Trash
  trash: (params?: Pick<EntryFilters, "page" | "page_size">) =>
    apiClient.get<PaginatedResponse<Entry>>("/entries/trash/", { params }),

  restore: (id: string) =>
    apiClient.post<Entry>(`/entries/${id}/restore/`),

  hardDelete: (id: string) =>
    apiClient.delete(`/entries/${id}/hard-delete/`),
};

// Insights
export const insightsApi = {
  streak: () =>
    apiClient.get<StreakData>("/entries/insights/streak/", {
      params: { tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
    }),

  moodTrend: (days?: number) =>
    apiClient.get<MoodTrendPoint[]>("/entries/insights/mood-trend/", {
      params: days ? { days } : undefined,
    }),

  monthlyRecap: () =>
    apiClient.get<MonthlyRecap>("/entries/insights/monthly-recap/"),

  onThisDay: () =>
    apiClient.get<OnThisDayEntry[]>("/entries/insights/on-this-day/"),

  heatmap: (year: number, month: number) =>
    apiClient.get<HeatmapData>("/entries/insights/heatmap/", { params: { year, month } }),
};

// Tags
export const tagsApi = {
  list: () =>
    apiClient.get<PaginatedResponse<Tag>>("/tags/"),

  create: (data: { name: string; color?: string }) =>
    apiClient.post<Tag>("/tags/", data),

  update: (id: string, data: { name?: string; color?: string }) =>
    apiClient.patch<Tag>(`/tags/${id}/`, data),

  delete: (id: string) =>
    apiClient.delete(`/tags/${id}/`),
};

// Account management
export const accountApi = {
  updateProfile: (data: FormData) =>
    apiClient.patch<User>("/auth/me/", data, {
      headers: { "Content-Type": undefined },
    }),

  changePassword: (data: { current_password: string; new_password: string; new_password_confirm: string }) =>
    apiClient.post<{ detail: string }>("/auth/change-password/", data),

  deleteAccount: (confirmEmail: string) =>
    apiClient.delete("/auth/me/", { data: { confirm_email: confirmEmail } }),

  exportEntries: () =>
    apiClient.get("/auth/export/", { responseType: "blob" }),
};

// Versions
export const versionsApi = {
  list: (entryId: string) =>
    apiClient.get<EntryVersion[]>(`/entries/${entryId}/versions/`),
};

// Share
export const shareApi = {
  enable: (entryId: string) =>
    apiClient.post<{ share_token: string }>(`/entries/${entryId}/share/`),

  disable: (entryId: string) =>
    apiClient.post<{ share_token: null }>(`/entries/${entryId}/unshare/`),

  /** Fetch a shared entry without auth — uses plain axios, no JWT. */
  getPublic: (token: string) =>
    axios.get<Entry>(`/api/v1/share/${token}/`),
};

// Attachments
export const attachmentsApi = {
  list: (entryId: string) =>
    apiClient.get<Attachment[]>(`/entries/${entryId}/attachments/`),

  upload: (entryId: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiClient.post<Attachment>(`/entries/${entryId}/attachments/`, form, {
      headers: { "Content-Type": undefined },
    })
  },

  delete: (entryId: string, attachmentId: string) =>
    apiClient.delete(`/entries/${entryId}/attachments/${attachmentId}/`),
}

// Admin Panel
export interface AdminEntryFilters {
  search?: string;
  view?: "all" | "active" | "deleted";
  ordering?: string;
  page?: number;
}

export interface AdminUserCreateData {
  email: string;
  username: string;
  password: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface AdminUserUpdateData {
  email?: string;
  username?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface AdminEntryWriteData {
  author?: string;
  title?: string;
  body?: string;
  mood?: string;
  is_favorite?: boolean;
  tags?: string[];
  is_deleted?: boolean;
}

export interface AdminTagWriteData {
  owner?: string;
  name?: string;
  color?: string;
}

export const adminApi = {
  stats: () =>
    apiClient.get<AdminStats>("/admin/stats/"),

  // Users
  listUsers: (params?: { search?: string; ordering?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<AdminUser>>("/admin/users/", { params }),

  createUser: (data: AdminUserCreateData) =>
    apiClient.post<AdminUser>("/admin/users/", data),

  updateUser: (id: string, data: AdminUserUpdateData) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/`, data),

  setPassword: (id: string, password: string) =>
    apiClient.post<{ detail: string }>(`/admin/users/${id}/set-password/`, { password }),

  toggleUser: (id: string, data: { is_active?: boolean; is_staff?: boolean }) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}/`, data),

  deleteUser: (id: string) =>
    apiClient.delete(`/admin/users/${id}/`),

  // Entries
  listEntries: (params?: AdminEntryFilters) =>
    apiClient.get<PaginatedResponse<AdminEntry>>("/admin/entries/", { params }),

  createEntry: (data: AdminEntryWriteData) =>
    apiClient.post<AdminEntry>("/admin/entries/", data),

  updateEntry: (id: string, data: AdminEntryWriteData) =>
    apiClient.patch<AdminEntry>(`/admin/entries/${id}/`, data),

  deleteEntry: (id: string) =>
    apiClient.delete(`/admin/entries/${id}/`),

  restoreEntry: (id: string) =>
    apiClient.post<AdminEntry>(`/admin/entries/${id}/restore/`),

  hardDeleteEntry: (id: string) =>
    apiClient.delete(`/admin/entries/${id}/hard-delete/`),

  // Tags
  listTags: (params?: { search?: string; ordering?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<AdminTag>>("/admin/tags/", { params }),

  createTag: (data: AdminTagWriteData) =>
    apiClient.post<AdminTag>("/admin/tags/", data),

  updateTag: (id: string, data: AdminTagWriteData) =>
    apiClient.patch<AdminTag>(`/admin/tags/${id}/`, data),

  deleteTag: (id: string) =>
    apiClient.delete(`/admin/tags/${id}/`),

  // Site settings
  getSettings: () =>
    apiClient.get<SiteSettings>("/admin/settings/"),

  updateSettings: (data: Partial<SiteSettings>) =>
    apiClient.patch<SiteSettings>("/admin/settings/", data),

  // Shared links
  listSharedLinks: (params?: { page?: number }) =>
    apiClient.get<PaginatedResponse<SharedLink>>("/admin/shared-links/", { params }),

  revokeSharedLink: (entryId: string) =>
    apiClient.post(`/admin/shared-links/${entryId}/revoke/`),
};
