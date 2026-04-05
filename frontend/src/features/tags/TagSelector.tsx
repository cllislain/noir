import { useState, useRef, useEffect } from "react"
import { useTags, useCreateTag } from "./useTags"
import { TagBadge } from "./TagBadge"
import { ColorPicker, TAG_COLORS } from "./ColorPicker"
import { TagManagePanel } from "./TagManagePanel"
import type { Tag } from "@/types"

function pickColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
}

interface TagSelectorProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function TagSelector({ selectedIds, onChange }: TagSelectorProps) {
  const { data: tags = [] } = useTags()
  const createTag = useCreateTag()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [newColor, setNewColor] = useState(pickColor)
  const [showManage, setShowManage] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id))
  const unselected = tags.filter((t) => !selectedIds.includes(t.id))
  const filtered = unselected.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  )

  const exactMatch = tags.some((t) => t.name.toLowerCase() === query.toLowerCase())
  const canCreate = query.trim().length > 0 && !exactMatch

  const add = (tag: Tag) => {
    onChange([...selectedIds, tag.id])
    setQuery("")
  }

  const remove = (id: string) => onChange(selectedIds.filter((i) => i !== id))

  const handleCreate = async () => {
    const name = query.trim()
    if (!name) return
    try {
      const res = await createTag.mutateAsync({ name, color: newColor })
      onChange([...selectedIds, res.data.id])
      setQuery("")
      setNewColor(pickColor())
    } catch { /* ignore — server error */ }
  }

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* Tag chips + search input row */}
        <div
          className="flex flex-wrap items-center gap-1 min-h-[2.5rem] px-2 py-1.5 border rounded-lg cursor-text"
          style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
          onClick={() => { setOpen(true); inputRef.current?.focus() }}
        >
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={() => remove(tag.id)}
            />
          ))}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault()
                handleCreate()
              }
            }}
            placeholder={selectedTags.length === 0 ? "Search or create a tag…" : ""}
            className="flex-1 min-w-[8rem] text-sm bg-transparent border-none outline-none"
            style={{ color: "var(--j-text-primary)" }}
          />
        </div>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute z-20 top-full mt-1 w-full max-h-64 overflow-y-auto border rounded-lg shadow-lg py-1"
            style={{ backgroundColor: "var(--j-bg-surface)", borderColor: "var(--j-border)" }}
          >
            {/* Existing matches */}
            {filtered.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(tag) }}
                className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
                style={{ color: "var(--j-text-secondary)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--j-bg-elevated)"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}

            {filtered.length === 0 && !canCreate && (
              <p className="px-3 py-2 text-sm" style={{ color: "var(--j-text-muted)" }}>
                {query ? `No tags matching "${query}"` : "All tags selected"}
              </p>
            )}

            {/* Inline create option with color picker */}
            {canCreate && (
              <>
                {filtered.length > 0 && (
                  <div className="mx-2 my-1 h-px" style={{ backgroundColor: "var(--j-border)" }} />
                )}

                {/* Color picker row */}
                <div className="px-3 py-1">
                  <p className="text-xs mb-1" style={{ color: "var(--j-text-muted)" }}>Pick a color</p>
                  <ColorPicker value={newColor} onChange={setNewColor} />
                </div>

                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleCreate() }}
                  disabled={createTag.isPending}
                  className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
                  style={{ color: "var(--j-accent)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--j-bg-elevated)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: newColor }}
                  />
                  <span className="font-bold">＋</span>
                  {createTag.isPending
                    ? `Creating "${query.trim()}"…`
                    : `Create "${query.trim()}"`}
                  <span className="ml-auto text-xs opacity-50">Enter ↵</span>
                </button>
              </>
            )}

            {/* Manage tags footer */}
            <div className="mx-2 my-1 h-px" style={{ backgroundColor: "var(--j-border)" }} />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); setShowManage(true) }}
              className="w-full text-left px-3 py-1.5 text-xs transition-colors"
              style={{ color: "var(--j-text-muted)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--j-bg-elevated)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
              }}
            >
              ⚙ Manage tags…
            </button>
          </div>
        )}
      </div>

      <TagManagePanel open={showManage} onClose={() => setShowManage(false)} />
    </>
  )
}
