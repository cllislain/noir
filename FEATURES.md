# Features & Version Log

**Current Version: v1.0.0**

Tracks every implemented feature, its status, and a backlog of planned work.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite 8 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| State | TanStack React Query 5 |
| Routing | React Router DOM 6 |
| HTTP | Axios 1.7 |
| Markdown | @uiw/react-md-editor 4 |
| Charts | recharts 2 |
| OAuth | @react-oauth/google |
| Backend | Django 5.1 + Django REST Framework 3.15 |
| Auth | JWT via djangorestframework-simplejwt + Google OAuth (google-auth) |
| Database | PostgreSQL 16 (psycopg3) |
| Filtering | django-filter |
| Container | Docker + docker-compose |

---

## Versioning convention

`v<major>.<minor>.<patch>`

| Bump | When |
|------|------|
| `patch` | Bug fix, copy change, minor style tweak |
| `minor` | New user-visible feature or visible UI change |
| `major` | Breaking change, full redesign, or DB migration |

---

## Changelog

### v1.0.0 — Production Release

**Google OAuth**
- [x] Google OAuth sign-in on Login and Register pages via `@react-oauth/google`
- [x] `POST /api/v1/auth/google/` — backend endpoint verifies Google ID token, issues JWT pair
- [x] `google-auth` library for server-side token verification
- [x] Seamless account creation on first OAuth sign-in

**UI / Performance**
- [x] Sticky sidebar — always visible while scrolling long entry lists
- [x] Heatmap live update — refreshes immediately after saving a new entry
- [x] Lazy loading for route-level components to reduce initial bundle size
- [x] Changelog page at `/changelog` listing all version history

**Deployment**
- [x] `docker-compose.prod.yml` — production multi-service compose file
- [x] `frontend/nginx.conf` — Nginx config for SPA routing + API proxy
- [x] `backend/.dockerignore` + `frontend/.dockerignore`
- [x] `DEPLOYMENT.md` — step-by-step VPS + Render deployment guide

---

### v0.12.0 — Account Management & Admin Rework

**Account settings**
- [x] Change password endpoint + UI form
- [x] Update display name and avatar
- [x] Account deletion with confirmation
- [x] Export all entries as `.zip` (individual markdown files)

**Security**
- [x] Rate limiting on auth endpoints via `AUTH_THROTTLE_RATE`
- [x] Inactivity auto-lock — re-prompts for password after configurable idle timeout

**Admin panel rework**
- [x] Full-width admin layout
- [x] `ThemeSwitcher` available in admin panel
- [x] Shared Links management page in admin
- [x] Settings page in admin

---

### v0.11.0 — Entry Versioning, Shared Links & Streak Cards

**Entry versioning**
- [x] `EntryVersion` model — snapshot saved on every edit
- [x] Edit history UI — view and restore previous versions from the entry detail page

**Shared read-only links**
- [x] `SharedLink` model with UUID token
- [x] `GET /api/v1/entries/{id}/share/` — generates a shareable link
- [x] Public read-only view accessible without authentication

**Insights**
- [x] Streak cards on Insights page — current streak + longest streak display

---

### v0.10.0 — More Themes & Custom Theme Builder

**New themes**
- [x] My Melody (`theme-mymelody`) — pink and white Sanrio aesthetic
- [x] Pompompurin (`theme-pompompurin`) — warm golden yellow + brown

**Custom theme builder**
- [x] In-app UI to pick accent and background colors with live preview
- [x] Export custom theme as JSON file
- [x] Import JSON theme file to restore or share custom themes

---

### v0.9.0 — Image Attachments, Templates & Sidebar Enhancements

**Image attachments**
- [x] `Attachment` model — `image` FileField per entry, stored in `media/`
- [x] Upload image from entry form; displayed in entry detail view
- [x] `GET /api/v1/entries/{id}/attachments/` endpoint

**Entry templates**
- [x] Pre-defined templates selectable when creating a new entry
- [x] Templates populate title and body starters (e.g., Gratitude, Daily Reflection)

**Sidebar**
- [x] Collapsible sidebar sections (stats, heatmap, nav)
- [x] Drag-to-reorder sidebar sections

---

### v0.8.0 — Search Highlighting, Date Range Filter & Tag Management

**Search**
- [x] Search result highlighting — matched terms wrapped in `<mark>` in entry list cards
- [x] Date range filter — "From" and "To" date pickers in the filter panel
- [x] Combined mood + tag + date filter (all filters compose server-side)

**Tag management**
- [x] Rename and delete tags from the admin tag management page
- [x] Tag usage count displayed in tag list
- [x] Tag color picker UI in the tag form

---

### v0.7.0 — Stickers, Handwriting Canvas & Sidebar Overhaul

**Stickers**
- [x] `Entry.stickers` — `JSONField(default=list)` storing `[{id, emoji, x, y, size}]` per entry
- [x] Migration `0003_entry_stickers_canvas.py` — adds `stickers` + `canvas_data` fields
- [x] `stickerPacks.ts` — 4 themed packs: Kuromi (goth), Cinnamoroll (soft), Bad Badtz-Maru (bold), Noir (moody); 20 stickers each
- [x] `StickerPicker` — pack tab buttons + 8-column emoji grid; calls `onPick(emoji)` on selection
- [x] `StickerOverlay` — `absolute inset-0` container; stickers draggable via Pointer Events API (% coords); corner resize handle (24–120 px); ✕ remove button; `readOnly` mode hides controls
- [x] Sticker picker toggle button + overlay in `EntryFormPage`; `readOnly` overlay in `EntryPage`
- [x] `stickers` included in create/update payload; serialized in `EntryDetailSerializer` + `EntryWriteSerializer`

**Handwriting Canvas**
- [x] `Entry.canvas_data` — `TextField(blank=True)` storing exported SVG string
- [x] `react-sketch-canvas ^6.2.0` added to `package.json`
- [x] `DrawingCanvas` — pen/eraser toggle, 10 color swatches, stroke-width range slider; exports SVG via `canvasRef.exportSvg()` on Save; Clear resets canvas + clears state
- [x] Canvas background auto-selects dark/light based on active theme ID
- [x] Canvas toggle button in `EntryFormPage`; SVG rendered via `dangerouslySetInnerHTML` in `EntryPage`
- [x] `canvas_data` included in create/update payload

**Sidebar Overhaul**
- [x] `AppSidebar` component replaces `SidebarNav` across all pages
- [x] Sections (top→bottom): brand "Noir" → `RealtimeClock` → `HeatmapCalendar` → `SidebarStats` → nav links → `{children}` slot → spacer → compact theme switcher → user info + logout
- [x] `RealtimeClock` — live `HH:mm:ss` + full date, updates every second
- [x] `HeatmapCalendar` — monthly activity grid; prev/next month nav; `color-mix()` for intensity (0→transparent, 1→35%, 2→60%, 3+→100%); click to filter dashboard entries to a single day; "Clear date filter" button
- [x] `insightsApi.heatmap(year, month)` + `useHeatmap` React Query hook with 5 min staleTime
- [x] `GET /api/v1/entries/insights/heatmap/?year=&month=` — returns `{year, month, days: {"YYYY-MM-DD": count}}`
- [x] `HeatmapData` interface added to `types/index.ts`
- [x] `setDateRange(after, before)` added to `useSearch` hook; dashboard passes to heatmap click handler
- [x] `DashboardPage` wired to `AppSidebar` with `onDateClick` / `activeDate` props; page-specific controls (New Entry, Favorites★, SearchBar, TagChips, FilterPanel) passed as children
- [x] All pages (`DashboardPage`, `InsightsPage`, `TrashPage`, `EntryPage`, `EntryFormPage`) updated to use `<AppSidebar />`
- [x] `Navbar` simplified — hamburger + brand link only (mobile); theme/user controls moved to sidebar

**Noir Theme**
- [x] `theme-noir` added to `global.css` — OLED black base (`#000000`), `#c8f135` ("Sergei's Glint") accent
- [x] `themes.ts` updated with Noir entry; `ThemeSwitcher` compact variant in sidebar shows icon-only buttons

**Data & types**
- [x] `PlacedSticker { id, emoji, x, y, size }` interface added to `types/index.ts`
- [x] `Entry` updated with `stickers?: PlacedSticker[]` and `canvas_data?: string`

---

### v0.6.0 — Insights, Monthly Recap & On This Day

**Mood chart**
- [x] `GET /api/v1/entries/insights/mood-trend/?days=N` — returns daily per-mood counts (last 90 days by default, max 365); aggregated server-side with `TruncDate` + `Count`
- [x] `MoodTrendChart` component — recharts `LineChart` with one line per mood (happy/neutral/sad/anxious/grateful); 30/60/90-day toggle pills; chart colors theme-neutral constants
- [x] Chart tooltips + legend styled with `--j-*` CSS tokens; empty state and skeleton while loading

**Monthly recap**
- [x] `GET /api/v1/entries/insights/monthly-recap/` — returns `total_entries`, `mood_distribution` (all 5 moods), and top 5 `top_tags` with usage count for the current calendar month
- [x] `MonthlyRecap` component — shows entry count, horizontal mood distribution bar chart, and top-tags color pills

**On this day**
- [x] `GET /api/v1/entries/insights/on-this-day/` — returns active entries written on the same month/day in previous years, with `years_ago` field
- [x] `OnThisDay` component — compact card rendered above the entry list on the dashboard; hidden when there are no historical entries; links directly to each entry

**Insights page**
- [x] `/insights` route added to `App.tsx` under `ProtectedRoute`
- [x] `InsightsPage` — responsive grid: mood chart (2/3 width on `lg`) + monthly recap (1/3 width); stacks vertically on mobile
- [x] `📊 Insights` nav item added to `SidebarNav` (between Journal and Trash)

**Data & types**
- [x] `MoodTrendPoint`, `TagCount`, `MonthlyRecap`, `OnThisDayEntry` interfaces added to `types/index.ts`
- [x] `insightsApi.moodTrend`, `insightsApi.monthlyRecap`, `insightsApi.onThisDay` added to `endpoints.ts`
- [x] `useMoodTrend`, `useMonthlyRecap`, `useOnThisDay` React Query hooks in `features/insights/useInsights.ts`
- [x] `recharts ^2.12.7` added to `package.json`

---

### v0.5.0 — Sort, Trash, Infinite Scroll & Keyboard Shortcut

**Sort controls**
- [x] Sort dropdown on dashboard — Newest, Oldest, Last Updated; integrates with existing `ordering` field in `EntryFilters`
- [x] Sort persists to `localStorage` under key `journal-sort`; restored on page load
- [x] `SortControl` component uses `--j-*` tokens, matches active pill style from FilterPanel
- [x] `setOrdering` added to `useSearch` hook
- [x] `SortOrder` union type (`-created_at | created_at | -updated_at`) exported from `endpoints.ts`

**Soft delete / Trash**
- [x] `Entry` model: `is_deleted` (BooleanField, db_index) + `deleted_at` (DateTimeField, nullable)
- [x] Migration `0002_entry_soft_delete.py`
- [x] `perform_destroy` overridden — DELETE requests soft-delete instead of hard-delete
- [x] `GET /api/v1/entries/trash/` — paginated list of soft-deleted entries
- [x] `POST /api/v1/entries/{id}/restore/` — restores entry back to active list
- [x] `DELETE /api/v1/entries/{id}/hard-delete/` — permanently deletes from trash
- [x] `EntryTrashSerializer` — includes `deleted_at` field
- [x] `TrashPage` — shows deleted entries with Restore and Delete forever actions, infinite scroll, skeleton loading, toasts
- [x] `useTrashEntries`, `useRestoreEntry`, `useHardDeleteEntry` hooks
- [x] `SidebarNav` component — navigation links (Journal, Trash) with active state, rendered in sidebar on both Dashboard and Trash pages
- [x] `/trash` route registered in `App.tsx`

**Infinite scroll**
- [x] `useInfiniteEntries` — uses `useInfiniteQuery`, extracts next page from DRF `next` URL
- [x] `InfiniteEntryList` component — `IntersectionObserver` sentinel (200px rootMargin) triggers `fetchNextPage`; shows 2 skeleton cards while fetching next page; "All entries loaded" end-of-list message
- [x] Dashboard replaced from `useEntries` + `EntryList` → `useInfiniteEntries` + `InfiniteEntryList`
- [x] `extractPage` utility parses `?page=N` from paginated URLs

**Keyboard shortcut**
- [x] Press `n` on the dashboard to navigate to `/entries/new`; ignored when focus is in any `input`, `textarea`, `select`, or `contenteditable` element
- [x] Keyboard hint displayed below search bar: `Press [n] to write a new entry`

---

### v0.4.0 — UX Polish & Entry Enhancements

**Bug Fix**
- [x] Tag selector — replaced static dropdown button with a searchable text input that filters tags by name; clicking anywhere in the field focuses the input; outside-click closes dropdown; `TagBadge` now calls `e.stopPropagation()` internally so removing chips doesn't reopen the dropdown

**Layout**
- [x] Entry detail page (`EntryPage`) spans full page width — removed `max-w-2xl mx-auto` constraint to match dashboard standard
- [x] Entry form page (`EntryFormPage`) spans full page width — same constraint removed

**Toast notifications**
- [x] `ToastProvider` + `useToast()` hook — global notification system wired into `App.tsx` inside `ThemeProvider` so toasts inherit CSS var tokens
- [x] `ToastContext` exposes `toast(message, type?, duration?)` — types: `success`, `error`, `info`
- [x] Toasts stack in top-right corner, auto-dismiss after 3.5 s, manually dismissable via × button
- [x] Slide-in animation (`toast-in` keyframe)
- [x] Toast triggered on: entry created, entry saved, entry deleted, save error, delete error, draft restored, draft discarded

**Autosave draft**
- [x] New entry form auto-saves title, body, and mood to `localStorage` key `journal-draft` with a 1 s debounce
- [x] On returning to the new entry form, a banner asks to restore or discard the draft
- [x] Draft cleared from `localStorage` on successful entry creation
- [x] Draft preserved on cancel/navigate-away so it can be restored later

**Word count + reading time**
- [x] Live word count and reading time estimate displayed above the markdown editor (only when content is non-empty)
- [x] Reading time calculated at 200 words/min, minimum 1 min

**Skeleton loading cards**
- [x] `EntryCardSkeleton` — pulsing placeholder matching exact EntryCard layout (title, preview lines, tag pills, date)
- [x] `EntryListSkeleton` — renders N skeleton cards (default 5) with a faux entry-count label
- [x] Dashboard loading spinner replaced with `EntryListSkeleton`; all skeleton colors use `--j-bg-elevated` token

---

### v0.3.0 — Theme System + Layout Overhaul
> Dashboard layout, persistent sidebar, and full multi-theme support.

**Layout**
- [x] Full-width dashboard layout — content spans the entire page width
- [x] Persistent left sidebar — always visible on tablet and desktop (≥ 768 px)
- [x] Mobile drawer sidebar — hidden by default, toggled via hamburger icon with overlay backdrop
- [x] Hamburger button in Navbar (mobile only, SVG icons, shows ✕ when open)
- [x] `Layout` component accepts a `sidebar` prop — pages without a sidebar render no aside

**Theme system**
- [x] CSS custom property architecture — all colors defined as `--j-*` tokens
- [x] `ThemeProvider` — applies theme class to `<html>`, persists selection to `localStorage`
- [x] `useTheme()` hook — exposes `{ themeId, theme, themes, setTheme }`
- [x] `ThemeSwitcher` dropdown in Navbar — shows icon, color swatches, active checkmark
- [x] Tailwind config extended with `j-*` color utilities mapped to CSS vars

**Themes included**
- [x] Light (`theme-light`) — default
- [x] Dark (`theme-dark`) — default dark
- [x] Kuromi (`theme-kuromi`) — kawaii goth, deep purple/black + fuchsia
- [x] Cinnamoroll (`theme-cinnamoroll`) — soft baby blue + lavender
- [x] Bad Badtz-Maru (`theme-badtzbadtzmaru`) — bold black/white + electric yellow

**Component updates**
- [x] All `dark:` Tailwind prefixes removed from every component and page
- [x] `MarkdownEditor` — color mode (`light`/`dark`) driven by active theme ID
- [x] `LoadingSpinner` — border and spinner color use `--j-accent` and `--j-border`
- [x] All buttons, inputs, cards, labels use `--j-*` tokens via `.btn-primary`, `.card`, etc.

**Bug fix**
- [x] `body_preview` added to `Entry` TypeScript interface (was missing, causing type errors)

**Docs**
- [x] `THEMING.md` — full guide for tokens, adding themes, layout conventions

---

### v0.2.0 — Core Journal Features
> Entry management, tagging, search, and filtering.

**Entries**
- [x] Create journal entry (title, body, mood, tags, favorite)
- [x] View single entry (markdown rendered, tags, mood, date)
- [x] Edit entry
- [x] Delete entry (with confirmation prompt)
- [x] Live markdown editor with preview (`@uiw/react-md-editor`)
- [x] `body_preview` returned by API for dashboard cards

**Dashboard**
- [x] Entry list with card layout (title, preview, mood emoji, tags, date, favorite star)
- [x] Entry count display
- [x] Empty state with prompt to create first entry
- [x] Loading spinner during data fetch

**Search & filtering**
- [x] Text search with 300 ms debounce
- [x] Filter by mood (happy, neutral, sad, anxious, grateful)
- [x] Filter by one or more tags (checkbox list)
- [x] Filter favorites only
- [x] Clear all filters button (shown only when filters are active)

**Tags**
- [x] Create tags with custom hex color
- [x] Tag badge component (colored dot + name)
- [x] Tag selector in entry form (multi-select dropdown)
- [x] Per-user tags (isolated by owner)

**Data**
- [x] `Entry` model — UUID PK, title, body, mood, is_favorite, tags (M2M), timestamps
- [x] `Tag` model — UUID PK, name, hex color, unique per owner
- [x] Paginated entry list API (`PaginatedResponse<Entry>`)
- [x] django-filter for server-side mood / tag / favorite filtering

---

### v0.1.0 — Auth & Project Foundation
> Project scaffolding, authentication, and routing.

**Authentication**
- [x] Register (email, username, password, confirm password — client + server validation)
- [x] Login with JWT (access + refresh tokens)
- [x] Token refresh on 401 via Axios interceptor
- [x] Logout (clears tokens from localStorage)
- [x] `useAuth()` hook — exposes `{ user, login, logout, register }`
- [x] `ProtectedRoute` — redirects unauthenticated users to `/login`
- [x] Redirect back to intended page after login

**Project structure**
- [x] Vite + React + TypeScript monorepo layout (`frontend/` + `backend/`)
- [x] Tailwind CSS with Inter + JetBrains Mono fonts
- [x] Path alias `@/` → `src/`
- [x] React Query with devtools
- [x] Axios client with base URL + auth header injection
- [x] `ErrorBoundary` — catches render errors, shows reload prompt
- [x] `NotFoundPage` — 404 catch-all route
- [x] Docker + docker-compose setup
- [x] Django apps: `accounts`, `entries`, `tags`
- [x] JWT via `djangorestframework-simplejwt`
- [x] CORS via `django-cors-headers`
- [x] pytest + factory-boy test setup

---

## Backlog

All previously planned features have been implemented as of v1.0.0.

### UI / UX
- [x] Collapsible sidebar toggle on desktop — done in v0.9.0
- [x] Entry sort order — newest / oldest / last updated — done in v0.5.0
- [x] Pagination or infinite scroll on dashboard — done in v0.5.0 (infinite scroll)
- [x] Skeleton loading cards instead of spinner — done in v0.4.0
- [x] Toast notifications (save success, delete, errors) — done in v0.4.0
- [x] Keyboard shortcut to open new entry (`n`) — done in v0.5.0
- [x] Autosave draft in entry form — done in v0.4.0

### Entries
- [x] Soft delete / trash with restore — done in v0.5.0
- [x] Entry word count display — done in v0.4.0
- [x] Reading time estimate — done in v0.4.0
- [x] Attachments / image upload — done in v0.9.0
- [x] Entry templates — done in v0.9.0

### Tagging
- [x] Rename and delete tags — done in v0.8.0
- [x] Tag color picker UI in form — done in v0.8.0
- [x] Tag usage count display — done in v0.8.0

### Themes
- [x] My Melody theme — done in v0.10.0
- [x] Pompompurin theme — done in v0.10.0
- [x] Custom theme builder — done in v0.10.0
- [x] Export / import custom theme as JSON — done in v0.10.0

### Search
- [x] Full-text search highlight in results — done in v0.8.0
- [x] Search by date range — done in v0.8.0
- [x] Combined mood + tag + date filter — done in v0.8.0

### Account
- [x] Change password — done in v0.12.0
- [x] Update display name — done in v0.12.0
- [x] Account deletion — done in v0.12.0
- [x] Export all entries as `.zip` (markdown files) — done in v0.12.0

### Insights
- [x] Mood trend chart over time — done in v0.6.0
- [x] Monthly recap (entry count, mood distribution, top tags) — done in v0.6.0
- [x] "On this day" memories on dashboard — done in v0.6.0
- [x] Streaks — longest journaling streak, current streak — done in v0.11.0
- [x] Heatmap calendar view of writing activity — done in v0.7.0

### Backend / API
- [x] Rate limiting on auth endpoints — done in v0.12.0
- [x] Entry versioning / edit history — done in v0.11.0
- [x] Shared read-only entry links — done in v0.11.0

---

## Notes

- See [THEMING.md](THEMING.md) for the full guide on adding themes and using CSS tokens.
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.
- Default theme on fresh installs is `dark` (set in `themes.ts` → `DEFAULT_THEME_ID`).
