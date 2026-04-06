import { useState } from "react"
import { Layout } from "@/components/Layout"
import { AppSidebar } from "@/components/AppSidebar"

interface ChangelogVersion {
  version: string
  label: string
  type: "major" | "minor" | "patch"
  date: string
  items: string[]
}

const VERSIONS: ChangelogVersion[] = [
  {
    version: "v1.0.0",
    label: "Final Release",
    type: "major",
    date: "2026-04",
    items: [
      "Google OAuth sign-in on Login and Register pages",
      "Sticky sidebar — only content area scrolls",
      "Heatmap updates instantly after create/delete/restore",
      "Changelog page (/changelog)",
      "Lazy-loaded page components for faster initial load",
      "Production Docker + Nginx + Gunicorn setup",
      "Comprehensive README, CHANGELOG, and DEPLOYMENT docs",
    ],
  },
  {
    version: "v0.12.0",
    label: "Account & Security",
    type: "minor",
    date: "2026-04",
    items: [
      "Change password from account settings",
      "Display name and avatar profile update",
      "Account deletion with email confirmation",
      "Export all entries as ZIP of Markdown files",
      "Rate limiting on auth endpoints (ScopedRateThrottle)",
      "Auto-lock session after inactivity (configurable)",
      "Admin panel: full-width layout, ThemeSwitcher, Shared Links, Site Settings pages",
    ],
  },
  {
    version: "v0.11.0",
    label: "Insights & Sharing",
    type: "minor",
    date: "2026-04",
    items: [
      "Current streak and longest streak display on Insights page",
      "Entry versioning — edit history panel shows previous versions",
      "Shared read-only entry links via public UUID token",
      "Public /share/:token page requires no authentication",
    ],
  },
  {
    version: "v0.10.0",
    label: "Themes Expansion",
    type: "minor",
    date: "2026-04",
    items: [
      "My Melody theme (soft pink + rose accent)",
      "Pompompurin theme (warm cream + amber accent)",
      "Custom theme builder — pick accent and background colors",
      "Live preview of custom theme",
      "Export/import custom theme as JSON",
    ],
  },
  {
    version: "v0.9.0",
    label: "Entries & Templates",
    type: "minor",
    date: "2026-03",
    items: [
      "Image attachments per entry (upload, gallery, delete)",
      "Entry templates (blank, gratitude, morning pages, weekly review, dream log)",
      "Collapsible sidebar with drag-to-reorder sections",
    ],
  },
  {
    version: "v0.8.0",
    label: "Tags & Search Enhancements",
    type: "minor",
    date: "2026-03",
    items: [
      "Full-text search highlight in entry results",
      "Search by date range with a date range picker",
      "Tag rename, delete, and color picker in admin panel",
      "Tag usage count display",
    ],
  },
  {
    version: "v0.7.0",
    label: "Stickers, Canvas & Sidebar Overhaul",
    type: "minor",
    date: "2026-03",
    items: [
      "Stickers — 4 themed packs, drag-to-position, resize, per-entry storage",
      "Handwriting canvas — pen/eraser, color swatches, SVG export",
      "New AppSidebar with RealtimeClock, HeatmapCalendar, SidebarStats",
      "Noir theme (OLED black + neon lime accent)",
    ],
  },
  {
    version: "v0.6.0",
    label: "Insights, Monthly Recap & On This Day",
    type: "minor",
    date: "2026-02",
    items: [
      "Mood trend chart (30/60/90 days, recharts)",
      "Monthly recap — entry count, mood distribution, top tags",
      "On This Day memories on dashboard",
      "Heatmap calendar of writing activity in sidebar",
    ],
  },
  {
    version: "v0.5.0",
    label: "Sort, Trash, Infinite Scroll & Shortcuts",
    type: "minor",
    date: "2026-02",
    items: [
      "Soft delete with trash and restore",
      "Entry sort — newest, oldest, last updated",
      "Infinite scroll on dashboard",
      "Keyboard shortcut `n` for new entry",
    ],
  },
  {
    version: "v0.4.0",
    label: "UX Polish & Autosave",
    type: "minor",
    date: "2026-02",
    items: [
      "Toast notifications system",
      "Autosave draft in entry form",
      "Word count and reading time estimate",
      "Skeleton loading cards",
    ],
  },
  {
    version: "v0.3.0",
    label: "Theme System & Layout",
    type: "minor",
    date: "2026-01",
    items: [
      "CSS custom property architecture (--j-* tokens)",
      "ThemeProvider with localStorage persistence",
      "5 built-in themes: Light, Dark, Kuromi, Cinnamoroll, Bad Badtz-Maru",
      "Full-width dashboard with persistent collapsible sidebar",
    ],
  },
  {
    version: "v0.2.0",
    label: "Core Journal Features",
    type: "minor",
    date: "2026-01",
    items: [
      "Create, read, edit, delete entries",
      "Mood tracking (happy, neutral, sad, anxious, grateful)",
      "Tags with hex colors, multi-select",
      "Text search and filters",
      "Favorites",
    ],
  },
  {
    version: "v0.1.0",
    label: "Foundation & Auth",
    type: "minor",
    date: "2025-12",
    items: [
      "JWT authentication (register, login, refresh, logout)",
      "ProtectedRoute and redirect after login",
      "Vite + React + TypeScript monorepo",
      "Docker + docker-compose setup",
      "PostgreSQL database",
    ],
  },
]

const TYPE_BADGE_STYLES: Record<ChangelogVersion["type"], React.CSSProperties> = {
  major: {
    backgroundColor: "rgba(251,191,36,0.15)",
    color: "#d97706",
    border: "1px solid rgba(251,191,36,0.4)",
  },
  minor: {
    backgroundColor: "rgba(59,130,246,0.1)",
    color: "#3b82f6",
    border: "1px solid rgba(59,130,246,0.3)",
  },
  patch: {
    backgroundColor: "var(--j-bg-elevated)",
    color: "var(--j-text-muted)",
    border: "1px solid var(--j-border)",
  },
}

function VersionCard({ entry, defaultOpen }: { entry: ChangelogVersion; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const isLatest = entry.version === VERSIONS[0].version

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: "var(--j-bg-surface)",
        borderColor: isLatest ? "var(--j-accent)" : "var(--j-border)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ backgroundColor: "transparent" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--j-bg-elevated)"
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="text-base font-bold font-mono"
            style={{ color: "var(--j-text-primary)" }}
          >
            {entry.version}
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--j-text-secondary)" }}
          >
            {entry.label}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={TYPE_BADGE_STYLES[entry.type]}
          >
            {entry.type}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span className="text-xs" style={{ color: "var(--j-text-muted)" }}>
            {entry.date}
          </span>
          <span
            className="text-xs transition-transform duration-200"
            style={{
              color: "var(--j-text-muted)",
              display: "inline-block",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        </div>
      </button>

      {open && (
        <div
          className="px-5 pb-4 border-t"
          style={{ borderColor: "var(--j-border)" }}
        >
          <ul className="mt-3 space-y-1.5">
            {entry.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm"
                style={{ color: "var(--j-text-secondary)" }}
              >
                <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--j-text-muted)" }}>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function ChangelogPage() {
  return (
    <Layout sidebar={<AppSidebar />}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--j-text-primary)" }}
          >
            Changelog
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--j-text-muted)" }}>
            Version history of Noir
          </p>
        </div>

        <div className="space-y-3">
          {VERSIONS.map((entry, index) => (
            <VersionCard key={entry.version} entry={entry} defaultOpen={index === 0} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
