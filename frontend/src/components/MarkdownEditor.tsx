import MDEditor from "@uiw/react-md-editor"
import { useTheme } from "@/theme/ThemeContext"

/** Theme IDs that have a dark background and need the dark editor palette */
const DARK_THEME_IDS = new Set(["dark", "kuromi", "badtzbadtzmaru"])

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  minHeight?: number
}

export function MarkdownEditor({ value, onChange, minHeight = 300 }: MarkdownEditorProps) {
  const { themeId } = useTheme()
  const colorMode = DARK_THEME_IDS.has(themeId) ? "dark" : "light"

  return (
    <div data-color-mode={colorMode}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? "")}
        height={minHeight}
        preview="live"
      />
    </div>
  )
}
