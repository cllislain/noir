# Changelog

All notable changes to Noir are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

---

## [1.0.0] - 2026-04

### Added
- Google OAuth sign-in on Login and Register pages via `@react-oauth/google`
- `POST /api/v1/auth/google/` backend endpoint — verifies Google ID token with `google-auth`, issues JWT pair; creates account on first sign-in
- Sticky sidebar — remains fixed while scrolling long entry lists
- Heatmap live update — activity grid refreshes immediately after a new entry is saved
- Lazy loading for route-level components, reducing initial JS bundle size
- `/changelog` page listing full version history in-app
- `docker-compose.prod.yml` — production-ready multi-service compose configuration
- `frontend/nginx.conf` — Nginx config for SPA routing, API proxy, media/static serving, security headers, and gzip compression
- `backend/.dockerignore` and `frontend/.dockerignore`
- `DEPLOYMENT.md` — step-by-step guide for VPS and Render deployment

---

## [0.12.0] - 2026-04

### Added
- Change password — form and API endpoint for updating the current user's password
- Display name and avatar — users can update their profile name and upload a profile picture
- Account deletion — permanent account removal with a confirmation dialog
- ZIP export — downloads all entries as individual markdown files in a `.zip` archive
- Rate limiting on all auth endpoints via `AUTH_THROTTLE_RATE` env variable (default `10/hour`)
- Inactivity auto-lock — re-prompts for credentials after a configurable idle timeout period
- Full-width admin panel layout
- `ThemeSwitcher` available inside the admin panel
- Shared Links management page in admin
- Settings management page in admin

---

## [0.11.0] - 2026-03

### Added
- `EntryVersion` model — full snapshot saved on every entry edit
- Edit history UI — view all previous versions of an entry and restore any snapshot from the entry detail page
- `SharedLink` model with UUID token for sharing individual entries
- `GET /api/v1/entries/{id}/share/` endpoint — generates or retrieves a shareable link
- Public read-only entry view accessible at `/share/{token}` without authentication
- Streak cards on Insights page — current journaling streak and longest streak displayed as stat cards

---

## [0.10.0] - 2026-04

### Added
- My Melody theme (`theme-mymelody`) — pink and white Sanrio aesthetic
- Pompompurin theme (`theme-pompompurin`) — warm golden yellow + brown palette
- Custom theme builder UI — color pickers for all `--j-*` tokens with live preview
- Export custom theme as a JSON file
- Import JSON theme file to restore or share a previously exported theme

---

## [0.9.0] - 2026-03

### Added
- `Attachment` model with `image` FileField; images stored under `media/`
- Image upload from the entry form; images displayed in the entry detail view
- `GET /api/v1/entries/{id}/attachments/` endpoint
- Entry templates — pre-defined starters (e.g., Gratitude, Daily Reflection) selectable when creating a new entry
- Collapsible sidebar sections (stats, heatmap, navigation) — each section toggles independently
- Drag-to-reorder sidebar sections — order persisted to `localStorage`

---

## [0.8.0] - 2026-03

### Added
- Search result highlighting — matched terms wrapped in `<mark>` within entry list cards
- Date range filter — "From" and "To" date pickers in the filter panel
- Combined mood + tag + date filtering — all active filters compose together server-side
- Rename and delete tags from the admin tag management page
- Tag usage count displayed in the tag list
- Tag color picker UI in the tag creation/edit form

---

## [0.7.0] - 2026-03

### Added
- `Entry.stickers` — `JSONField(default=list)` storing placed stickers `[{id, emoji, x, y, size}]`
- `Entry.canvas_data` — `TextField(blank=True)` storing exported SVG from the handwriting canvas
- Migration `0003_entry_stickers_canvas.py`
- `stickerPacks.ts` — 4 themed packs (Kuromi, Cinnamoroll, Bad Badtz-Maru, Noir), 20 stickers each
- `StickerPicker` component — pack tab buttons + 8-column emoji grid
- `StickerOverlay` component — draggable stickers (Pointer Events API, % coords), corner resize handle (24–120 px), remove button; read-only mode for entry view
- `DrawingCanvas` component — pen/eraser toggle, 10 color swatches, stroke-width slider, SVG export; auto dark/light background based on active theme
- `AppSidebar` component — replaces `SidebarNav`; sections: brand, `RealtimeClock`, `HeatmapCalendar`, `SidebarStats`, nav links, theme switcher, user info
- `RealtimeClock` — live `HH:mm:ss` + full date, ticking every second
- `HeatmapCalendar` — monthly activity grid with prev/next month navigation; click to filter dashboard to a single day
- `GET /api/v1/entries/insights/heatmap/?year=&month=` — returns `{year, month, days: {"YYYY-MM-DD": count}}`
- `useHeatmap` React Query hook (5 min staleTime)
- `theme-noir` — OLED black (`#000000`) base with `#c8f135` ("Sergei's Glint") accent

### Changed
- All pages updated to use `<AppSidebar />` in place of the previous `SidebarNav`
- `Navbar` simplified to hamburger + brand link only on mobile; theme/user controls moved to sidebar

---

## [0.6.0] - 2026-03

### Added
- `GET /api/v1/entries/insights/mood-trend/?days=N` — daily per-mood counts aggregated with `TruncDate` + `Count`
- `MoodTrendChart` — recharts `LineChart`, one line per mood, 30/60/90-day toggle pills
- `GET /api/v1/entries/insights/monthly-recap/` — total entries, mood distribution, top 5 tags for current month
- `MonthlyRecap` component — entry count, horizontal mood bar, top-tag pills
- `GET /api/v1/entries/insights/on-this-day/` — entries from same month/day in previous years, includes `years_ago`
- `OnThisDay` component — compact card above entry list on the dashboard; hidden when empty
- `/insights` route and `InsightsPage` — responsive grid: mood chart (2/3) + monthly recap (1/3)
- `recharts ^2.12.7` added

---

## [0.5.0] - 2026-02

### Added
- Sort dropdown on dashboard — Newest, Oldest, Last Updated; persists to `localStorage`
- `SortControl` component using `--j-*` tokens
- `Entry.is_deleted` and `Entry.deleted_at` fields; migration `0002_entry_soft_delete.py`
- `GET /api/v1/entries/trash/` — paginated list of soft-deleted entries
- `POST /api/v1/entries/{id}/restore/` — restores a soft-deleted entry
- `DELETE /api/v1/entries/{id}/hard-delete/` — permanently removes from trash
- `TrashPage` with infinite scroll, skeleton loading, and toast feedback
- `useInfiniteEntries` using `useInfiniteQuery`; `InfiniteEntryList` with `IntersectionObserver` sentinel
- Keyboard shortcut `n` — navigates to `/entries/new` from the dashboard (ignored when a form field is focused)
- Keyboard hint below search bar: `Press [n] to write a new entry`

### Changed
- Dashboard entry list replaced from paginated `useEntries` to infinite-scroll `useInfiniteEntries`
- DELETE entry endpoint now performs a soft delete; hard delete requires explicit `/hard-delete/` call

---

## [0.4.0] - 2026-02

### Added
- `ToastProvider` + `useToast()` hook — global notification system; types: `success`, `error`, `info`
- Toasts stack top-right, auto-dismiss after 3.5 s, manually dismissable; slide-in animation
- Autosave draft — new entry form saves title/body/mood to `localStorage` (`journal-draft`) with 1 s debounce
- Draft restore banner on returning to the new entry form; draft cleared on successful save
- Live word count and reading time estimate above the markdown editor (200 wpm, min 1 min)
- `EntryCardSkeleton` and `EntryListSkeleton` — pulsing placeholders matching EntryCard layout

### Changed
- Dashboard loading spinner replaced with `EntryListSkeleton`
- Entry detail and form pages widened to full page width (removed `max-w-2xl mx-auto`)

### Fixed
- Tag selector — replaced static dropdown button with searchable text input; outside-click closes dropdown; `TagBadge` stops propagation to prevent reopening on chip removal

---

## [0.3.0] - 2026-01

### Added
- CSS custom property theme system — all colors defined as `--j-*` tokens in `global.css`
- `ThemeProvider` — applies theme class to `<html>`, persists to `localStorage` (`journal-theme`)
- `useTheme()` hook — `{ themeId, theme, themes, setTheme }`
- `ThemeSwitcher` dropdown in Navbar — swatches + active checkmark
- Tailwind config extended with `j-*` utilities mapped to CSS vars
- Themes: Light (`theme-light`), Dark (`theme-dark`), Kuromi (`theme-kuromi`), Cinnamoroll (`theme-cinnamoroll`), Bad Badtz-Maru (`theme-badtzbadtzmaru`)
- Persistent left sidebar (≥ 768 px); mobile drawer sidebar with hamburger toggle and overlay backdrop
- `THEMING.md` documentation

### Changed
- All `dark:` Tailwind prefixes removed — light/dark variants handled entirely by theme tokens
- `MarkdownEditor` color mode driven by active theme ID
- All buttons, inputs, cards use `--j-*` tokens via shared CSS classes

### Fixed
- `body_preview` added to `Entry` TypeScript interface (was missing, causing type errors)

---

## [0.2.0] - 2026-01

### Added
- Create, view, edit, and delete journal entries (title, body, mood, tags, favorite)
- Live markdown editor with preview (`@uiw/react-md-editor`)
- `body_preview` field returned by API for dashboard cards
- Dashboard entry list — card layout with title, preview, mood emoji, tags, date, favorite star
- Entry count display and empty state
- Text search with 300 ms debounce
- Mood filter (happy, neutral, sad, anxious, grateful)
- Tag filter (checkbox list) and favorites filter
- Clear all filters button
- `Tag` model — UUID PK, name, hex color, unique per owner
- Tag badge component; multi-select tag dropdown in entry form
- Paginated entry list API; `django-filter` for server-side filtering

---

## [0.1.0] - 2025-12

### Added
- Register endpoint and form (email, username, password, confirm password)
- Login with JWT — access + refresh tokens stored in `localStorage`
- Token refresh on 401 via Axios interceptor
- Logout action — clears tokens
- `useAuth()` hook — `{ user, login, logout, register }`
- `ProtectedRoute` — redirects unauthenticated users to `/login`; restores intended URL after login
- Vite + React 18 + TypeScript frontend scaffolding
- Tailwind CSS with Inter + JetBrains Mono fonts; path alias `@/` → `src/`
- React Query with devtools; Axios client with base URL + auth header injection
- `ErrorBoundary` for render error recovery; `NotFoundPage` 404 catch-all
- Docker + docker-compose setup (PostgreSQL 16, Django backend, Vite dev server)
- Django apps: `accounts`, `entries`, `tags`
- `djangorestframework-simplejwt` for JWT; `django-cors-headers` for CORS
- pytest + factory-boy test infrastructure
