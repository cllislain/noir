import { useState, useEffect, useCallback, type ReactNode } from "react"
import { ThemeContext } from "./ThemeContext"
import { THEMES, DEFAULT_THEME_ID, CUSTOM_THEME_STORAGE_KEY } from "./themes"
import type { CustomThemeData } from "./themes"

const STORAGE_KEY = "journal-theme"

/** CSS variable names that a custom theme sets on <html>. */
const CUSTOM_CSS_VARS: Array<[keyof CustomThemeData, string]> = [
  ["bgBase",        "--j-bg-base"],
  ["bgSurface",     "--j-bg-surface"],
  ["bgElevated",    "--j-bg-elevated"],
  ["sidebarBg",     "--j-sidebar-bg"],
  ["sidebarBorder", "--j-sidebar-border"],
  ["textPrimary",   "--j-text-primary"],
  ["textSecondary", "--j-text-secondary"],
  ["textMuted",     "--j-text-muted"],
  ["border",        "--j-border"],
  ["accent",        "--j-accent"],
  ["accentHover",   "--j-accent-hover"],
  ["accentText",    "--j-accent-text"],
  ["ring",          "--j-ring"],
]

function applyCustomVars(data: CustomThemeData) {
  const root = document.documentElement
  for (const [key, cssVar] of CUSTOM_CSS_VARS) {
    root.style.setProperty(cssVar, data[key] as string)
  }
}

function clearCustomVars() {
  const root = document.documentElement
  for (const [, cssVar] of CUSTOM_CSS_VARS) {
    root.style.removeProperty(cssVar)
  }
}

function resolveTheme(id: string) {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!
}

function loadCustomTheme(): CustomThemeData | null {
  try {
    const raw = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CustomThemeData) : null
  } catch {
    return null
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID
    } catch {
      return DEFAULT_THEME_ID
    }
  })

  const [customTheme, setCustomThemeState] = useState<CustomThemeData | null>(loadCustomTheme)

  // Apply theme whenever themeId or customTheme changes
  useEffect(() => {
    const root = document.documentElement

    if (themeId === "custom" && customTheme) {
      // Remove all built-in theme classes, add marker class
      THEMES.forEach((t) => root.classList.remove(t.htmlClass))
      root.classList.add("theme-custom")
      applyCustomVars(customTheme)
    } else {
      // Clear any custom inline vars, apply built-in class
      clearCustomVars()
      root.classList.remove("theme-custom")
      THEMES.forEach((t) => root.classList.remove(t.htmlClass))
      root.classList.add(resolveTheme(themeId).htmlClass)
    }

    try {
      localStorage.setItem(STORAGE_KEY, themeId)
    } catch {
      // storage unavailable
    }
  }, [themeId, customTheme])

  const setTheme = useCallback((id: string) => {
    if (id === "custom" && customTheme) {
      setThemeId("custom")
    } else if (THEMES.some((t) => t.id === id)) {
      setThemeId(id)
    }
  }, [customTheme])

  const setCustomTheme = useCallback((data: CustomThemeData) => {
    try {
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage unavailable
    }
    setCustomThemeState(data)
    setThemeId("custom")
  }, [])

  const clearCustomTheme = useCallback(() => {
    try {
      localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY)
    } catch {
      // ignore
    }
    clearCustomVars()
    setCustomThemeState(null)
    setThemeId(DEFAULT_THEME_ID)
  }, [])

  const theme = themeId === "custom" && customTheme
    ? { id: "custom", label: customTheme.name, htmlClass: "theme-custom", swatches: [customTheme.bgBase, customTheme.accent, customTheme.textPrimary] as [string, string, string], icon: "🎨" }
    : resolveTheme(themeId)

  return (
    <ThemeContext.Provider value={{ themeId, theme, themes: THEMES, setTheme, customTheme, setCustomTheme, clearCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
