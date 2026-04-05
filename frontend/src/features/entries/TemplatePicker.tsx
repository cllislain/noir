import { useState, useRef, useEffect } from "react"
import { ENTRY_TEMPLATES } from "./entryTemplates"

interface TemplatePickerProps {
  currentBody: string
  onSelect: (body: string) => void
}

export function TemplatePicker({ currentBody, onSelect }: TemplatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const handleSelect = (body: string) => {
    setOpen(false)
    if (currentBody.trim() && !window.confirm("This will replace your current content. Continue?")) return
    onSelect(body)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors"
        style={{
          borderColor: "var(--j-border)",
          color: "var(--j-text-secondary)",
          backgroundColor: "var(--j-bg-elevated)",
        }}
      >
        <span>📋</span>
        Use template
        <span className="text-xs opacity-60">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="absolute z-20 top-full mt-1 left-0 w-52 border rounded-lg shadow-lg py-1"
          style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
        >
          {ENTRY_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(tpl.body) }}
              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
              style={{ color: "var(--j-text-secondary)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--j-bg-elevated)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
              }}
            >
              <span>{tpl.icon}</span>
              {tpl.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
