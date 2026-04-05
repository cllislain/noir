export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar: string | null;
  is_staff: boolean;
  date_joined: string;
}

export interface SiteSettings {
  default_inactivity_timeout: number;
  auth_throttle_rate?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  entry_count?: number;
}

export interface Attachment {
  id: string;
  file: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface PlacedSticker {
  id: string;
  emoji: string;
  x: number;   // percent of container width
  y: number;   // percent of container height
  size: number; // px
}

export interface Entry {
  id: string;
  title: string;
  body: string;
  body_preview?: string;
  mood: MoodValue | "";
  is_favorite: boolean;
  tags: Tag[];
  stickers?: PlacedSticker[];
  canvas_data?: string;
  attachments?: Attachment[];
  share_token?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface EntryVersion {
  id: string;
  version_num: number;
  title: string;
  body: string;
  mood: MoodValue | "";
  edited_at: string;
}

export type MoodValue = "happy" | "neutral" | "sad" | "anxious" | "grateful";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}

// ── Insights ──────────────────────────────────────────────────────────────

export interface MoodTrendPoint {
  date: string;
  happy: number;
  neutral: number;
  sad: number;
  anxious: number;
  grateful: number;
}

export interface TagCount {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface MonthlyRecap {
  month: string;
  total_entries: number;
  mood_distribution: Record<MoodValue, number>;
  top_tags: TagCount[];
}

export interface StreakData {
  current_streak: number
  longest_streak: number
  today_count: number
}

export interface HeatmapData {
  year: number;
  month: number;
  days: Record<string, number>; // "YYYY-MM-DD" → count
}

export interface OnThisDayEntry {
  id: string;
  title: string;
  mood: MoodValue | "";
  created_at: string;
  years_ago: number;
}

// ── Admin Panel ─────────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  active_users: number;
  staff_users: number;
  total_entries: number;
  active_entries: number;
  deleted_entries: number;
  total_tags: number;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  entry_count: number;
}

export interface AdminEntry {
  id: string;
  title: string;
  body: string;
  body_preview: string;
  mood: MoodValue | "";
  is_favorite: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  author_email: string;
  author_username: string;
  tag_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SharedLink {
  id: string;
  title: string;
  author_username: string;
  author_email: string;
  share_token: string;
  created_at: string;
}

export interface AdminTag {
  id: string;
  name: string;
  color: string;
  owner_email: string;
  owner_username: string;
  entry_count: number;
  created_at: string;
}
