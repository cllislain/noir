import { useState, useRef, type ChangeEvent } from "react"
import { useTheme } from "./ThemeContext"
import { deriveCustomTheme, CUSTOM_THEME_REQUIRED_KEYS } from "./themes"
import type { CustomThemeData } from "./themes"
import { useToast } from "@/toast/ToastContext"

interface Props {
  onClose: () => void
}

export function CustomThemeBuilder({ onClose }: Props) {
  const { customTheme, setCustomTheme, clearCustomTheme } = useTheme()
  const { toast } = useToast()

  const [name, setName]       = useState(customTheme?.name ?? "My Theme")
  const [accent, setAccent]   = useState(customTheme?.accent ?? "#6366f1")
  const [bgBase, setBgBase]   = useState(customTheme?.bgBase ?? "#0f0f0f")

  const importRef = useRef<HTMLInputElement>(null)

  const preview = deriveCustomTheme(name || "My Theme", accent, bgBase)

  function handleSave() {
    setCustomTheme(preview)
    toast("Custom theme applied", "success")
    onClose()
  }

  function handleClear() {
    clearCustomTheme()
    toast("Custom theme removed", "info")
    onClose()
  }

  function handleExport() {
    const json = JSON.stringify({ ...preview, name: name || "My Theme" }, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `${(name || "my-theme").toLowerCase().replace(/\s+/g, "-")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Record<string, unknown>
        // Validate all required keys exist and are strings
        for (const key of CUSTOM_THEME_REQUIRED_KEYS) {
          if (typeof parsed[key] !== "string") {
            toast(`Invalid theme file: missing field "${key}"`, "error")
            return
          }
        }
        const data = parsed as unknown as CustomThemeData
        setName(data.name)
        setAccent(data.accent)
        setBgBase(data.bgBase)
        setCustomTheme(data)
        toast(`Theme "${data.name}" imported`, "success")
        onClose()
      } catch {
        toast("Failed to parse theme file", "error")
      }
    }
    reader.readAsText(file)
    // Reset input so re-importing the same file triggers onChange
    e.target.value = ""
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border shadow-2xl p-5 space-y-4"
        style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base" style={{ color: "var(--j-text-primary)" }}>
            🎨 Custom Theme Builder
          </h2>
          <button
            onClick={onClose}
            className="text-lg leading-none opacity-60 hover:opacity-100"
            style={{ color: "var(--j-text-primary)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="label">Theme name</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            placeholder="My Theme"
          />
        </div>

        {/* Color pickers */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">Accent color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border"
                style={{ borderColor: "var(--j-border)", padding: "2px" }}
              />
              <span className="text-xs font-mono" style={{ color: "var(--j-text-muted)" }}>{accent}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="label">Background color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgBase}
                onChange={(e) => setBgBase(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border"
                style={{ borderColor: "var(--j-border)", padding: "2px" }}
              />
              <span className="text-xs font-mono" style={{ color: "var(--j-text-muted)" }}>{bgBase}</span>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <label className="label">Preview</label>
          <div
            className="rounded-xl border p-3 space-y-2"
            style={{
              backgroundColor: preview.bgBase,
              borderColor: preview.border,
            }}
          >
            <div
              className="rounded-lg p-2 text-xs font-medium"
              style={{ backgroundColor: preview.bgSurface, color: preview.textPrimary, borderColor: preview.border }}
            >
              <span style={{ color: preview.textPrimary }}>{name || "My Theme"}</span>
              <span style={{ color: preview.textMuted }}> · sample entry text</span>
            </div>
            <div className="flex gap-2">
              <span
                className="px-3 py-1 rounded-lg text-xs font-medium"
                style={{ backgroundColor: preview.accent, color: preview.accentText }}
              >
                Button
              </span>
              <span
                className="px-3 py-1 rounded-lg text-xs border"
                style={{ backgroundColor: preview.bgSurface, color: preview.textSecondary, borderColor: preview.border }}
              >
                Secondary
              </span>
              <span
                className="px-2 py-1 rounded-full text-xs border"
                style={{ backgroundColor: preview.bgElevated, color: preview.textMuted, borderColor: preview.border }}
              >
                Tag
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button type="button" className="btn-primary w-full" onClick={handleSave}>
            Save &amp; Apply
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary flex-1 text-xs"
              onClick={handleExport}
              title="Export theme as JSON"
            >
              Export JSON
            </button>
            <button
              type="button"
              className="btn-secondary flex-1 text-xs"
              onClick={() => importRef.current?.click()}
              title="Import theme from JSON"
            >
              Import JSON
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
          </div>

          {customTheme && (
            <button
              type="button"
              className="btn-danger w-full text-xs"
              onClick={handleClear}
            >
              Remove custom theme
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
