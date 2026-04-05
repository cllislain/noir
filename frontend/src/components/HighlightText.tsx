interface HighlightTextProps {
  text: string
  query: string
  className?: string
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function HighlightText({ text, query, className }: HighlightTextProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>
  }

  const regex = new RegExp(`(${escapeRegex(query.trim())})`, "gi")
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded-sm px-0.5"
            style={{
              backgroundColor: "var(--j-accent)",
              color: "var(--j-accent-text)",
              fontWeight: 600,
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}
