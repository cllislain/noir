export const TAG_COLORS = [
  "#818cf8", "#c026d3", "#3b82f6", "#4ade80",
  "#fb923c", "#f43f5e", "#c8f135", "#0ea5e9",
  "#a855f7", "#14b8a6", "#f59e0b", "#10b981",
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5 p-1">
      {TAG_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          title={color}
          onMouseDown={(e) => { e.preventDefault(); onChange(color) }}
          className="w-5 h-5 rounded-full flex-shrink-0 transition-transform hover:scale-110"
          style={{
            backgroundColor: color,
            outline: value === color ? `2px solid var(--j-text-primary)` : "none",
            outlineOffset: "2px",
          }}
          aria-pressed={value === color}
          aria-label={`Color ${color}`}
        />
      ))}
    </div>
  )
}
