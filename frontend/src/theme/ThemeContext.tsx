import { createContext, useContext } from "react"
import type { Theme, CustomThemeData } from "./themes"
import { THEMES, DEFAULT_THEME_ID } from "./themes"

interface ThemeContextValue {
  themeId: string
  theme: Theme
  themes: Theme[]
  setTheme: (id: string) => void
  customTheme: CustomThemeData | null
  setCustomTheme: (data: CustomThemeData) => void
  clearCustomTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME_ID,
  theme: THEMES[0],
  themes: THEMES,
  setTheme: () => undefined,
  customTheme: null,
  setCustomTheme: () => undefined,
  clearCustomTheme: () => undefined,
})

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
