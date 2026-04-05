interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onChange: (start: string | undefined, end: string | undefined) => void
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const handleStart = (val: string) => {
    const start = val || undefined
    // If start is after end, clear end
    const end = start && endDate && start > endDate ? undefined : endDate
    onChange(start, end)
  }

  const handleEnd = (val: string) => {
    const end = val || undefined
    // If end is before start, clear start
    const start = end && startDate && end < startDate ? undefined : startDate
    onChange(start, end)
  }

  const inputStyle = {
    backgroundColor: "var(--j-bg-elevated)",
    borderColor: "var(--j-border)",
    color: "var(--j-text-primary)",
    colorScheme: "dark" as const,
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label
          className="text-xs w-8 flex-shrink-0"
          style={{ color: "var(--j-text-muted)" }}
        >
          From
        </label>
        <input
          type="date"
          value={startDate ?? ""}
          max={endDate}
          onChange={(e) => handleStart(e.target.value)}
          className="flex-1 text-xs px-2 py-1 rounded border outline-none"
          style={inputStyle}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <label
          className="text-xs w-8 flex-shrink-0"
          style={{ color: "var(--j-text-muted)" }}
        >
          To
        </label>
        <input
          type="date"
          value={endDate ?? ""}
          min={startDate}
          onChange={(e) => handleEnd(e.target.value)}
          className="flex-1 text-xs px-2 py-1 rounded border outline-none"
          style={inputStyle}
        />
      </div>
    </div>
  )
}
