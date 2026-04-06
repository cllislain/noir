export interface Theme {
  id: string
  label: string
  /** CSS class applied to <html> element */
  htmlClass: string
  /** Three swatch hex colors shown in the picker */
  swatches: [string, string, string]
  /** Emoji icon shown in navbar button */
  icon: string
}

/** All CSS variable values for a user-built custom theme. */
export interface CustomThemeData {
  name: string
  accent: string
  accentHover: string
  accentText: string
  bgBase: string
  bgSurface: string
  bgElevated: string
  sidebarBg: string
  sidebarBorder: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  ring: string
}

export const CUSTOM_THEME_STORAGE_KEY = "journal-custom-theme"

/** Required keys for import validation. */
export const CUSTOM_THEME_REQUIRED_KEYS: (keyof CustomThemeData)[] = [
  "name", "accent", "accentHover", "accentText",
  "bgBase", "bgSurface", "bgElevated",
  "sidebarBg", "sidebarBorder",
  "textPrimary", "textSecondary", "textMuted",
  "border", "ring",
]

/** Derive all CSS vars from just an accent color and a background color. */
export function deriveCustomTheme(name: string, accent: string, bgBase: string): CustomThemeData {
  const isDark = relativeLuminance(bgBase) < 0.35

  const bgSurface  = isDark ? lighten(bgBase, 0.06) : "#ffffff"
  const bgElevated = isDark ? lighten(bgBase, 0.12) : darken(bgBase, 0.05)
  const sidebarBg  = isDark ? darken(bgBase, 0.02) : lighten(bgBase, 0.02)
  const border     = isDark ? lighten(bgBase, 0.14) : darken(bgBase, 0.10)

  const textPrimary   = isDark ? "#f5f5f5" : "#111111"
  const textSecondary = isDark ? "#d4d4d4" : "#374151"
  const textMuted     = isDark ? "#a3a3a3" : "#6b7280"

  const accentHover = darken(accent, 0.15)
  const accentText  = relativeLuminance(accent) > 0.35 ? "#000000" : "#ffffff"
  const ring        = lighten(accent, 0.15)

  return {
    name,
    accent,
    accentHover,
    accentText,
    bgBase,
    bgSurface,
    bgElevated,
    sidebarBg,
    sidebarBorder: border,
    textPrimary,
    textSecondary,
    textMuted,
    border,
    ring,
  }
}

// ─── Color math helpers ──────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r + 255 * amount, g + 255 * amount, b + 255 * amount)
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r - 255 * amount, g - 255 * amount, b - 255 * amount)
}

/**
 * To add a new theme:
 * 1. Add a Theme entry here.
 * 2. Add a matching `.theme-<htmlClass>` block with --j-* variables in global.css.
 * The ThemeSwitcher renders all themes from this list automatically.
 */
export const THEMES: Theme[] = [
  {
    id: "light",
    label: "Light",
    htmlClass: "theme-light",
    swatches: ["#f9fafb", "#4f46e5", "#111827"],
    icon: "☀️",
  },
  {
    id: "dark",
    label: "Dark",
    htmlClass: "theme-dark",
    swatches: ["#030712", "#818cf8", "#f9fafb"],
    icon: "🌙",
  },
  {
    id: "kuromi",
    label: "Kuromi",
    htmlClass: "theme-kuromi",
    swatches: ["#1a0a2e", "#c026d3", "#f5d0fe"],
    icon: "🖤",
  },
  {
    id: "cinnamoroll",
    label: "Cinnamoroll",
    htmlClass: "theme-cinnamoroll",
    swatches: ["#eff8ff", "#3b82f6", "#e0f2fe"],
    icon: "☁️",
  },
  {
    id: "badtzbadtzmaru",
    label: "Bad Badtz-Maru",
    htmlClass: "theme-badtzbadtzmaru",
    swatches: ["#0a0a0a", "#facc15", "#fafafa"],
    icon: "🐧",
  },
  {
    id: "noir",
    label: "Sergei Noir",
    htmlClass: "theme-noir",
    swatches: ["#000000", "#c8f135", "#f0f0f0"],
    icon: "🐈‍⬛",
  },
  {
    id: "mymelody",
    label: "Leyley",
    htmlClass: "theme-mymelody",
    swatches: ["#fff0f5", "#f43f8e", "#4a0020"],
    icon: "🎀",
  },
  {
    id: "pompompurin",
    label: "Pompompurin",
    htmlClass: "theme-pompompurin",
    swatches: ["#fffbeb", "#d97706", "#451a03"],
    icon: "🍮",
  },
]

export const DEFAULT_THEME_ID = "dark"
