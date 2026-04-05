import { useState, useRef, useEffect } from "react"
import { useTheme } from "@/theme/ThemeContext"
import { CustomThemeBuilder } from "@/theme/CustomThemeBuilder"

export function ThemeSwitcher() {
  const { themeId, theme, themes, setTheme, customTheme } = useTheme()
  const [open, setOpen]       = useState(false)
  const [building, setBuilding] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5"
          aria-label="Switch theme"
          title={`Theme: ${theme.label}`}
        >
          <span>{theme.icon}</span>
          <span className="hidden sm:inline">{theme.label}</span>
          <span className="text-xs opacity-60">{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-56 rounded-xl border shadow-lg z-50 py-1 overflow-hidden"
            style={{
              backgroundColor: "var(--j-bg-surface)",
              borderColor: "var(--j-border)",
            }}
          >
            {/* Built-in themes */}
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
                style={{
                  backgroundColor: themeId === t.id ? "var(--j-bg-elevated)" : "transparent",
                  color: "var(--j-text-primary)",
                }}
                onMouseEnter={(e) => {
                  if (themeId !== t.id) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--j-bg-elevated)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (themeId !== t.id) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
                  }
                }}
              >
                <span className="text-base w-5 text-center">{t.icon}</span>
                <span className="flex gap-0.5">
                  {t.swatches.map((hex, i) => (
                    <span
                      key={i}
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: hex, borderColor: "var(--j-border)" }}
                    />
                  ))}
                </span>
                <span className="flex-1 text-left font-medium">{t.label}</span>
                {themeId === t.id && (
                  <span style={{ color: "var(--j-accent)" }}>✓</span>
                )}
              </button>
            ))}

            {/* Custom theme row (only when one is saved) */}
            {customTheme && (
              <button
                onClick={() => { setTheme("custom"); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
                style={{
                  backgroundColor: themeId === "custom" ? "var(--j-bg-elevated)" : "transparent",
                  color: "var(--j-text-primary)",
                }}
                onMouseEnter={(e) => {
                  if (themeId !== "custom") {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--j-bg-elevated)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (themeId !== "custom") {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
                  }
                }}
              >
                <span className="text-base w-5 text-center">🎨</span>
                <span className="flex gap-0.5">
                  {([customTheme.bgBase, customTheme.accent, customTheme.textPrimary] as string[]).map((hex, i) => (
                    <span
                      key={i}
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: hex, borderColor: "var(--j-border)" }}
                    />
                  ))}
                </span>
                <span className="flex-1 text-left font-medium truncate">{customTheme.name}</span>
                {themeId === "custom" && (
                  <span style={{ color: "var(--j-accent)" }}>✓</span>
                )}
              </button>
            )}

            {/* Divider + builder button */}
            <div className="border-t my-1" style={{ borderColor: "var(--j-border)" }} />
            <button
              onClick={() => { setBuilding(true); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
              style={{ color: "var(--j-accent)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--j-bg-elevated)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
              }}
            >
              <span className="text-base w-5 text-center">✏️</span>
              <span className="font-medium">
                {customTheme ? "Edit custom theme…" : "Build custom theme…"}
              </span>
            </button>
          </div>
        )}
      </div>

      {building && <CustomThemeBuilder onClose={() => setBuilding(false)} />}
    </>
  )
}
