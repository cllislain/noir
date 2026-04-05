import type { SortOrder } from "@/api/endpoints"

interface SortOption {
  value: SortOrder
  label: string
}

const OPTIONS: SortOption[] = [
  { value: "-created_at", label: "Newest" },
  { value: "created_at",  label: "Oldest" },
  { value: "-updated_at", label: "Last updated" },
]

interface SortControlProps {
  value: SortOrder | undefined
  onChange: (order: SortOrder) => void
}

export function SortControl({ value, onChange }: SortControlProps) {
  const current = value ?? "-created_at"

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs" style={{ color: "var(--j-text-muted)" }}>Sort:</span>
      <div className="flex gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-2.5 py-1 rounded-lg text-xs border transition-colors"
            style={
              current === opt.value
                ? {
                    backgroundColor: "var(--j-accent)",
                    color: "var(--j-accent-text)",
                    borderColor: "var(--j-accent)",
                  }
                : {
                    backgroundColor: "var(--j-bg-surface)",
                    color: "var(--j-text-secondary)",
                    borderColor: "var(--j-border)",
                  }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
